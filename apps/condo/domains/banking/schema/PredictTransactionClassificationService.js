/**
 * Generated by `createservice banking.PredictTransactionClassificationService --type queries`
 */

const fetch = require('node-fetch')

const conf = require('@open-condo/config')
const { GQLError, GQLErrorCode: { INTERNAL_ERROR } } = require('@open-condo/keystone/errors')
const { GQLCustomSchema, getById } = require('@open-condo/keystone/schema')

const access = require('@condo/domains/banking/access/PredictTransactionClassificationService')
const { NOT_FOUND } = require('@condo/domains/common/constants/errors')

const ML_SPACE_TRANSACTION_CLASSIFIER = conf['ML_SPACE_TRANSACTION_CLASSIFIER'] ? JSON.parse(conf['ML_SPACE_TRANSACTION_CLASSIFIER']) : {}


/**
 * List of possible errors, that this custom schema can throw
 * They will be rendered in documentation section in GraphiQL for this custom schema
 */
const errors = {
    COST_ITEM_NOT_FOUND: {
        query: 'predictTransactionClassification',
        code: INTERNAL_ERROR,
        type: NOT_FOUND,
        message: 'Bank cost item not found',
        messageForUser: 'api.user.predictTransactionClassification.COST_ITEM_NOT_FOUND',
    },
    TRANSACTION_PREDICT_REQUEST_FAILED: {
        query: 'predictTransactionClassification',
        code: INTERNAL_ERROR,
        type: NOT_FOUND,
        message: 'ML server response is not successful',
        messageForUser: 'api.user.predictTransactionClassification.COST_ITEM_NOT_FOUND',
    },
    ML_SPACE_NOT_CONFIGURED: {
        query: 'predictTransactionClassification',
        code: INTERNAL_ERROR,
        type: NOT_FOUND,
        message: 'ML_SPACE_TRANSACTION_CLASSIFIER env variable needs to have endpoint, authKey, workspace',
        messageForUser: 'api.user.predictTransactionClassification.ML_SPACE_NOT_CONFIGURED',
    },
}

const PredictTransactionClassificationService = new GQLCustomSchema('PredictTransactionClassificationService', {
    types: [
        {
            access: true,
            type: 'input PredictTransactionClassificationInput { purpose: String! }',
        },
        {
            access: true,
            type: 'type Category { id: ID!, name: String! }',
        },
        {
            access: true,
            type: 'type PredictTransactionClassificationOutput { id: ID!, name: String!, isOutcome: Boolean!, category: Category }',
        },
    ],
    
    queries: [
        {
            access: access.canPredictTransactionClassification,
            schema: 'predictTransactionClassification (data: PredictTransactionClassificationInput!): PredictTransactionClassificationOutput',
            doc: {
                summary: 'Returns id of BankCostItem corresponding to specified payment purpose string',
                description: 'Matching is performed by empirical model, implemented in external microservice "condo-classifier-api"',
                errors,
            },
            resolver: async (parent, args, context) => {
                const { data: { purpose } } = args
                if (conf.NODE_ENV === 'test' || !ML_SPACE_TRANSACTION_CLASSIFIER) {
                    return null
                }

                const { endpoint, authKey, workspace } = ML_SPACE_TRANSACTION_CLASSIFIER
                if (!endpoint || !authKey || !workspace) {
                    throw new GQLError(errors.ML_SPACE_NOT_CONFIGURED, context)
                }
                const response = await fetch(endpoint, {
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/json',
                        'cookie': `authservice_session=${authKey}`,
                        'x-workspace-id': workspace,
                    },
                    method: 'POST',
                    body: JSON.stringify({ instances: [ { ticket: purpose } ] }),
                })
                if (response.status !== 200) {
                    throw new GQLError(errors.TRANSACTION_PREDICT_REQUEST_FAILED, context)
                }
                const result = await response.json()
                const { prediction: [id] } = result
                const costItem = await getById('BankCostItem', id)
                if (!costItem) {
                    throw new GQLError(errors.COST_ITEM_NOT_FOUND, context)
                }
                return costItem
            },
        },
    ],
    
})

module.exports = {
    PredictTransactionClassificationService,
}
