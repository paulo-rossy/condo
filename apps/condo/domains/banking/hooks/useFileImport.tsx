import get from 'lodash/get'
import isNull from 'lodash/isNull'
import React, { useState, useCallback, useEffect, useMemo, useContext } from 'react'

import { getClientSideSenderInfo } from '@open-condo/codegen/utils/userId'
import { useAuth } from '@open-condo/next/auth'

import FileImportButton from '@condo/domains/banking/components/FileImportButton'
import { useBankSyncTaskUIInterface } from '@condo/domains/banking/hooks/useBankSyncTaskUIInterface'
import { TasksContext, TASK_STATUS } from '@condo/domains/common/components/tasks'
import { useTaskLauncher } from '@condo/domains/common/components/tasks/TaskLauncher'

import type { BankAccount as BankAccountType } from '@app/condo/schema'
import type { FileImportProps } from '@condo/domains/banking/components/FileImportButton'
import type { UploadRequestOption } from 'rc-upload/lib/interface'

type FileImportHookProps = {
    propertyId: string
    organizationId: string
    bankAccount?: BankAccountType
}

type WrappedComponentType = (props: Pick<FileImportProps, 'type' | 'children' | 'hidden'>) => ReturnType<typeof FileImportButton>

interface IUseFileImport {
    ({ propertyId, bankAccount, organizationId }: FileImportHookProps): ({
        Component: WrappedComponentType,
        file: UploadRequestOption['file'],
        loading: boolean,
    })
}

const useFileImport: IUseFileImport = ({ propertyId, bankAccount, organizationId }) => {
    const [file, setFile] = useState<UploadRequestOption['file']>(null)

    const { user } = useAuth()
    const { BankSyncTask: BankSyncTaskUIInterface } = useBankSyncTaskUIInterface()
    const { loading, handleRunTask } = useTaskLauncher(BankSyncTaskUIInterface, {
        dv: 1,
        sender: getClientSideSenderInfo(),
        user: { connect: { id: get(user, 'id') } },
        property: { connect: { id: propertyId } },
        organization: { connect: { id: organizationId } },
        ...(bankAccount && { account: { connect: { id: get(bankAccount, 'id') } } }),
        ...(bankAccount && { integrationContext: { connect: { id: get(bankAccount, 'integrationContext.id') } } }),
        file,
    })
    const { tasks } = useContext(TasksContext)

    useEffect(() => {
        if (!isNull(file) && !loading) {
            handleRunTask()
        }
    }, [file, loading])
    useEffect(() => {
        if (tasks.length) {
            const bankSyncTask = tasks.find(task => task.record.__typename === 'BankSyncTask'
                && task.record.status === TASK_STATUS.PROCESSING
                && get(task, 'record.property.id') === propertyId
            )

            if (bankSyncTask) {
                setFile(null)
            }
        }
    }, [tasks, propertyId, loading])

    const handleUpload = useCallback((options: UploadRequestOption) => {
        setFile(options.file)
    }, [])

    const Component = useMemo<WrappedComponentType>(() => (props) => {
        return (
            <FileImportButton
                handleUpload={handleUpload}
                type={props.type}
                loading={loading}
            >
                {props.children}
            </FileImportButton>
        )
    }, [handleUpload, loading])

    return {
        Component,
        file,
        loading,
    }
}

export { useFileImport }
