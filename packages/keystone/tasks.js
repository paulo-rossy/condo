const Queue = require('bull')
const { get } = require('lodash')

const conf = require('@open-condo/config')

const { _internalGetExecutionContextAsyncLocalStorage } = require('./executionContext')
const { getLogger } = require('./logging')
const { gauge } = require('./metrics')
const { prepareKeystoneExpressApp } = require('./prepareKeystoneApp')
const { getRedisClient } = require('./redis')
const { getRandomString } = require('./test.utils')

const TASK_TYPE = 'TASK'
/* TODO: change this value to 'medium'
   The 'tasks' name was initially defined as default queue name.
   So for better migration experience we decided to leave this name as a default queue name */
const DEFAULT_QUEUE_NAME = 'tasks'
const DEFAULT_QUEUES = ['low', 'tasks', 'high']
const WORKER_CONCURRENCY = parseInt(conf.WORKER_CONCURRENCY || '2')
const IS_BUILD = conf['DATABASE_URL'] === 'undefined'
// NOTE: If this is True, all tasks will be executed in the node process with setTimeout.
const FAKE_WORKER_MODE = conf.TESTS_FAKE_WORKER_MODE
const logger = getLogger('worker')

const QUEUES = new Map()

const KEEP_JOBS_CONFIG = { age: 60 * 60 * 24 * 30 } // 30 days
const GLOBAL_TASK_OPTIONS = { removeOnComplete: KEEP_JOBS_CONFIG, removeOnFail: KEEP_JOBS_CONFIG }
const TASKS = new Map()
const CRON_TASKS = new Map()
const REMOVE_CRON_TASKS = []
let isWorkerCreated = false

function createTaskQueue (name) {
    if (IS_BUILD) return

    QUEUES.set(name, new Queue(name, {
        /**
         * @param {'client' | 'subscriber' | 'bclient'} type
         * @return {import('ioredis')}
         */
        createClient: (type, opts) => {
            // NOTE(pahaz): https://github.com/OptimalBits/bull/issues/1873
            //   Bull uses three Redis connection. Probably, we can share regular Redis connection for type 'client' think about it!
            if (['bclient', 'subscriber'].includes(type)) {
                opts.maxRetriesPerRequest = null
            }
            return getRedisClient('worker', type, opts)
        },
    }))
}

/**
 * Creates and register task. After that you can call it with delay or applyAsync methods
 * @param name {String} name of the task
 * @param fn {Function} function that will be executed at the worker side
 * @param opts {Object} bull task options
 * @param queue {String} task queue to which this function will be added. Can be used for change priority of the task execution
 * @return {(function(): never)|*}
 */
function createTask (name, fn, opts = {}, queue) {
    if (typeof fn !== 'function') throw new Error('unsupported fn argument type. Function expected')
    if (!name) throw new Error('no name')
    if (get(opts, 'priority')) throw new Error('Deprecated task parameter priority. Please don\'t use it. You can change task running priority via queue property')

    if (TASKS.has(name)) throw new Error(`Task with name ${name} is already registered`)
    TASKS.set(name, fn)
    return createTaskWrapper(name, fn, opts, queue)
}

/**
 * Creates and register cron task. It will be called at the defined period of time
 * @param name {String} name of cron task
 * @param cron {String} cron style definition string. For example, 0 12 * * *
 * @param fn {Function} function that will be executed at the worker side
 * @param opts {Object} bull task options
 * @param queue {String} task queue to which this function will be added. Can be used for change priority of the task execution
 * @return {(function(): never)|*}
 */
function createCronTask (name, cron, fn, opts = {}, queue) {
    if (typeof fn !== 'function') throw new Error('unsupported fn argument type. Function expected')
    if (!name) throw new Error('no name')
    if (!cron) throw new Error('no cron string')
    if (get(opts, 'priority')) throw new Error('Deprecated task parameter priority. Please don\'t use it. You can change task running priority via queue property')

    const taskOpts = { repeat: { cron }, ...opts }
    const task = createTask(name, fn, taskOpts, queue)
    CRON_TASKS.set(name, taskOpts)
    return task
}

function removeCronTask (name, cron, opts = {}) {
    const taskOpts = { repeat: { cron }, ...opts }
    REMOVE_CRON_TASKS.push([name, taskOpts])
}

async function _scheduleRemoteTask (name, preparedArgs, preparedOpts, queue) {
    logger.info({ msg: 'Scheduling task', name, queue, data: { preparedArgs, preparedOpts } })

    if (!QUEUES.has(queue)) {
        logger.warn({
            msg: `No active queues with name = ${queue} was found. This task never been picked by this worker due to queue filters policy`,
            name, queue, data: { preparedOpts, preparedArgs },
        })
        // Maybe we should completely remove this task from TASKS
        return false
    }

    const job = await QUEUES.get(queue).add(name, { args: preparedArgs }, preparedOpts)
    return {
        id: String(job.id),
        getState: async () => {
            return await job.getState()
        },
        awaitResult: async () => {
            return await job.finished()
        },
    }
}

/**
 * Because Bull does not participates in case of execution tasks with `FAKE_WORKER_MODE`,
 * an instance of a job, that is passed to worker function should have the same
 * methods as in Bull.
 * This helps to avoid handling `FAKE_WORKER_MODE` in every custom worker function.
 * Ideally the interface should be exactly the same as in "Bull", but currently only `.progress`
 * method is used in worker functions. So, make it simple.
 */
class InProcessFakeJob {
    constructor (name) {
        this.name = name
        this.id = getRandomString()
    }
    progress (percent) {
        logger.info({ msg: 'Progress for task', id: this.id, name: this.name, progress: percent })
    }
}

async function _scheduleInProcessTask (name, preparedArgs, preparedOpts) {
    // NOTE: it's just for test purposes
    // similar to https://docs.celeryproject.org/en/3.1/configuration.html#celery-always-eager
    logger.info({ msg: 'Scheduling task', name, data: { preparedArgs, preparedOpts } })

    const job = new InProcessFakeJob(name)
    let error = undefined
    let result = undefined
    let status = 'processing'
    let executor = async function inProcessExecutor () {
        try {
            logger.info({ msg: 'Executing task', name, data: { preparedArgs, preparedOpts } })
            result = await executeTask(name, preparedArgs, job)
            status = 'completed'
            logger.info({ msg: 'Task result', name, status, data: { result, preparedArgs, preparedOpts } })
        } catch (e) {
            logger.error({ msg: 'Error executing task', name, error: e, data: { preparedArgs, preparedOpts } })
            status = 'error'
            error = e
        }
    }

    setTimeout(executor, 1)

    return {
        id: job.id,
        getState: async () => { return Promise.resolve(status) },
        awaitResult: async () => {
            return new Promise((res, rej) => {
                const handler = setInterval(() => {
                    if (status === 'completed') {
                        clearInterval(handler)
                        res(result)
                    } else if (status === 'error') {
                        clearInterval(handler)
                        rej(error)
                    }
                }, 120)
            })
        },
    }
}

/**
 * Internal function! please don't use it directly! Use `task.delay(..)`
 * @deprecated for any external usage!
 */
async function scheduleTaskByNameWithArgsAndOpts (name, args, opts = {}, queue) {
    if (typeof name !== 'string' || !name) throw new Error('task name invalid or empty')
    if (!isSerializable(args)) throw new Error('task args is not serializable')

    const preparedArgs = createSerializableCopy([...args])
    const preparedOpts = {
        ...GLOBAL_TASK_OPTIONS,
        ...opts,
    }

    if (FAKE_WORKER_MODE) {
        return await _scheduleInProcessTask(name, preparedArgs, preparedOpts)
    }

    return await _scheduleRemoteTask(name, preparedArgs, preparedOpts, queue)
}

function createTaskWrapper (name, fn, defaultTaskOptions = {}, queue = DEFAULT_QUEUE_NAME) {
    async function applyAsync (args, taskOptions, queueOverride) {
        const preparedOpts = {
            ...GLOBAL_TASK_OPTIONS,
            ...defaultTaskOptions,
            ...taskOptions,
        }

        return await scheduleTaskByNameWithArgsAndOpts(name, args, preparedOpts, queueOverride ? queueOverride : queue)
    }

    async function delay () {
        return await applyAsync([...arguments])
    }

    function errorTaskCallPrevent () {
        throw new Error('This function is converted to a task, and you need to use fn.delay(...) to call the tasks')
    }

    if (fn.delay || fn.applyAsync) throw new Error('You trying to create two tasks for one function! You MUST use one function only for one task!')

    fn.delay = delay
    fn.applyAsync = applyAsync
    errorTaskCallPrevent.delay = delay
    errorTaskCallPrevent.applyAsync = applyAsync
    errorTaskCallPrevent._type = TASK_TYPE
    delay.fn = fn
    applyAsync.fn = fn
    return errorTaskCallPrevent
}

function registerTasks (modulesList) {
    modulesList.forEach(
        (module) => {
            Object.values(module).forEach(
                (task) => {
                    if (task._type !== TASK_TYPE) {
                        console.error(task)
                        throw new Error('Wrong task module export format! What\'s this? You should wrap everything by createTask()')
                    }
                })
        })
}

function registerTaskQueues (queueNames = DEFAULT_QUEUES) {
    queueNames.forEach(name => {
        if (!name) throw new Error('Queue creation requires name')
        if (QUEUES.has(name)) throw new Error(`Queue with name ${name} already created`)

        createTaskQueue(name)
    })
}

async function removeQueue (name) {
    if (!QUEUES.has(name)) throw new Error('You are trying to delete queue that doesn\'t exist')

    await QUEUES.get(name).close()
    QUEUES.delete(name)
}

function createSerializableCopy (data) {
    return JSON.parse(JSON.stringify(data))
}

function isSerializable (data) {
    try {
        JSON.stringify(data)
        return true
    } catch (e) {
        return false
    }
}

function executeTask (name, args, job = null) {
    // Since executeTask is synchronous we should use enterWith:
    // From the docs:
    // Transitions into the context for the remainder of the current synchronous execution and then persists the store through any following asynchronous calls.
    _internalGetExecutionContextAsyncLocalStorage().enterWith({ taskId: job.id, taskName: job.name })

    if (!TASKS.has(name)) throw new Error(`executeTask: Unknown task name ${name}`)
    if (!isSerializable(args)) throw new Error('executeTask: args is not serializable')

    const fn = TASKS.get(name)
    const result = fn.apply(job, args)

    return result
}

function getTaskLoggingContext (job) {
    const jobData = job.toJSON()
    if (typeof jobData.data !== 'undefined') jobData.data = JSON.stringify(jobData.data)
    if (typeof jobData.returnvalue !== 'undefined') jobData.returnvalue = JSON.stringify(jobData.returnvalue)
    return jobData
}

/**
 *
 * @param keystoneModule
 * @param config
 * @return {Promise<void>}
 */
async function createWorker (keystoneModule, config) {
    // NOTE: we should have only one worker per node process!
    if (isWorkerCreated) {
        logger.warn('Call createWorker() more than one time! (ignored)')
        return
    } else {
        isWorkerCreated = true
        logger.info('Creating worker process')
    }

    // we needed to prepare keystone to use it inside tasks logic!
    if (keystoneModule) {
        await prepareKeystoneExpressApp(keystoneModule)
    } else {
        logger.warn('Keystone APP context is not prepared! You can\'t use Keystone GQL query inside the tasks!')
    }

    // Reapply queues configuration with worker startup config
    if (get(config, '0', []).length > 0) {
        let parsedConfig
        try {
            parsedConfig = JSON.parse(config[0])
        } catch (e) {
            throw new Error('Can\'t parse worker config. Please provide correct value')
        }

        if (parsedConfig['include'] && parsedConfig['include'].length > 0) {
            const queuesToDelete = Array.from(QUEUES.entries()).filter(queue => !parsedConfig['include'].includes(queue[0]))

            for (const [queueName] of queuesToDelete) {
                QUEUES.delete(queueName)
            }
        }

        if (parsedConfig['exclude'] && parsedConfig['exclude'].length > 0) {
            const queuesToDelete = Array.from(QUEUES.entries()).filter(queue => parsedConfig['exclude'].includes(queue[0]))
            for (const [queueName] of queuesToDelete) {
                await removeQueue(queueName)
            }
        }
    }

    const activeQueues = Array.from(QUEUES.entries())

    // Apply callbacks to each created queue
    activeQueues.forEach(([queueName, queue]) => {
        queue.process('*', WORKER_CONCURRENCY, async function (job) {
            logger.info({ taskId: job.id, status: 'processing', queue: queueName, task: getTaskLoggingContext(job) })
            try {
                return await executeTask(job.name, job.data.args, job)
            } catch (error) {
                logger.error({ taskId: job.id, status: 'error', error, queue: queueName, task: getTaskLoggingContext(job) })
                throw error
            }
        })

        queue.on('failed', function (job) {
            logger.info({ taskId: job.id, status: 'failed', queue: queueName, task: getTaskLoggingContext(job) })
        })

        queue.on('completed', function (job) {
            logger.info({ taskId: job.id, status: 'completed', queue: queueName, task: getTaskLoggingContext(job), t0: job.finishedOn - job.timestamp, t1: job.processedOn - job.timestamp, t2: job.finishedOn - job.processedOn })
            gauge({ name: `worker.${job.name}ExecutionTime`, value: job.finishedOn - job.processedOn })
        })
    })

    for (const [, queue] of activeQueues) {
        await queue.isReady()
    }

    logger.info(`Worker[${activeQueues.map(([name]) => name).join(',')}]: ready to work!`)

    const cronTasksNames = [...CRON_TASKS.keys()]
    if (cronTasksNames.length > 0) {
        logger.info({ msg: 'Worker: add repeatable tasks!', names: cronTasksNames })
        cronTasksNames.forEach((name) => {
            const fn = TASKS.get(name)
            fn.delay()
        })
    }
    const removeTasksNames = REMOVE_CRON_TASKS.map(x => x[0])
    if (removeTasksNames.length > 0) {
        logger.info({ msg: 'Worker: remove tasks!', names: removeTasksNames })

        REMOVE_CRON_TASKS.forEach(([name, opts]) => {
            activeQueues.forEach(([_, queue]) => {
                queue.removeRepeatable(name, opts.repeat)
            })
        })
    }
}

module.exports = {
    taskQueues: QUEUES,
    createTask,
    createCronTask,
    removeCronTask,
    registerTasks,
    createWorker,
    registerTaskQueues,
    scheduleTaskByNameWithArgsAndOpts,
}
