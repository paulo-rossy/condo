/**
 * Generated by `createservice common._internalScheduleTaskByNameService --type mutations`
 * In most cases you should not change it by hands
 * Please, don't remove `AUTOGENERATE MARKER`s
 */

const gql = require('graphql-tag')

const { generateGqlQueries } = require('@open-condo/codegen/generate.gql')


const COMMON_FIELDS = 'id dv sender { dv fingerprint } v deletedAt newId createdBy { id name } updatedBy { id name } createdAt updatedAt'

// TODO(codegen): write return type result!

const _INTERNAL_SCHEDULE_TASK_BY_NAME_MUTATION = gql`
    mutation _internalScheduleTaskByName ($data: _internalScheduleTaskByNameInput!) {
        result: _internalScheduleTaskByName(data: $data) { id }
    }
`

/* AUTOGENERATE MARKER <CONST> */

module.exports = {
    _INTERNAL_SCHEDULE_TASK_BY_NAME_MUTATION,
/* AUTOGENERATE MARKER <EXPORTS> */
}
