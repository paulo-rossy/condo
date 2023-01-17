import type { ValidateFunction } from 'ajv'
import type { ErrorCode, ErrorReason } from './errors'
import type { 
    RequestParams as BridgeRequestParams,
    ResultResponseData as BridgeResponseData,
} from '@open-condo/bridge'
import type { AnalyticsParams } from '@open-condo/ui/src/components/_utils/analytics'

export const COMMON_ERROR_PREFIX = 'CondoWebAppCommonError' as const

export type RequestParamsMap = {
    // Analytics
    CondoWebSendAnalyticsEvent: AnalyticsParams
    // Bridge
    CondoWebAppResizeWindow: BridgeRequestParams<'CondoWebAppResizeWindow'>
}

export type HandlerResultsMap = {
    // Analytics
    CondoWebSendAnalyticsEvent: { sent: boolean }
    // Bridge
    CondoWebAppResizeWindow: BridgeResponseData<'CondoWebAppResizeWindow'>
}

export type AllRequestMethods = keyof RequestParamsMap
export type RequestParams<Method extends AllRequestMethods> = RequestParamsMap[Method]
export type HandlerResult<Method extends AllRequestMethods> = HandlerResultsMap[Method]
export type RequestHandler<Method extends AllRequestMethods> = (params: RequestParams<Method>) => HandlerResult<Method>
export type RequestParamValidator<Method extends AllRequestMethods> = ValidateFunction<RequestParams<Method>>
export type RequestIdType = string | number
export type RequestId = { requestId?: RequestIdType }
type ResponseEventNames<T extends AllRequestMethods, R extends string, E extends string> = Record<T, {
    result: R,
    error: E
}>
export type ResponseEventNamesMap = ResponseEventNames<'CondoWebAppResizeWindow', 'CondoWebAppResizeWindowResult', 'CondoWebAppResizeWindowError'> &
ResponseEventNames<'CondoWebSendAnalyticsEvent', 'CondoWebSendAnalyticsEventResult', 'CondoWebSendAnalyticsEventError'>

export type ClientErrorResponse<Method extends AllRequestMethods, Reason extends ErrorReason> = {
    type: ResponseEventNamesMap[Method]['error'] | typeof COMMON_ERROR_PREFIX
    data: {
        errorType: 'client'
        errorCode: ErrorCode<Reason>
        errorReason: Reason
        errorMessage: string
    } & RequestId
}