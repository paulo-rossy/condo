/**
 * @type {Cypress.PluginConfig}
 */
const { writeFile } = require('node:fs/promises')

const Metrics = require('@open-condo/keystone/metrics')

const registredTraces = []

const METRIC_PREFIX = 'cypress.'
const TRACES_REPORT_FILENAME = 'traces.json'

module.exports = async (on, config) => {

    on('task', {
        async 'metrics:histogram' ([name, value]) {
            console.log(`Logged metric: ${name} : ${value}`)
            Metrics.histogram({ name: METRIC_PREFIX + name, value })
            return null
        },

        'metrics:endTrace' ([trace]) {
            registredTraces.push(trace)
            return null
        },

        'metrics:getTraces' () {
            return registredTraces
        },
    })

    on('after:run', async (results) => {
        console.log('[metrics.js] Saving traces...')
        const path = process.cwd() + '/' + TRACES_REPORT_FILENAME
        await writeFile(path, JSON.stringify(registredTraces), 'utf8')
        console.log(`[metrics.js] Metrics have been saved to ${path}`)
    })

    return config
}