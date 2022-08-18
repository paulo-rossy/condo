/**
 * Generated by `createschema onboarding.OnBoarding 'completed:Checkbox; stepsTransitions:Json;'`
 * In most cases you should not change it by hands
 * Please, don't remove `AUTOGENERATE MARKER`s
 */

const { generateGqlQueries } = require('@condo/keystone/codegeneration/generate.gql')

const { gql } = require('graphql-tag')

const COMMON_FIELDS = 'id dv sender { dv fingerprint } v deletedAt newId createdBy { id name } updatedBy { id name } createdAt updatedAt completed'

const ON_BOARDING_FIELDS = `{ completed stepsTransitions ${COMMON_FIELDS} type user { id } }`
const OnBoarding = generateGqlQueries('OnBoarding', ON_BOARDING_FIELDS)

const ON_BOARDING_STEP_FIELDS = `{ icon title titleNonLocalized description descriptionNonLocalized action entity onBoarding { id } ${COMMON_FIELDS} required order }`
const OnBoardingStep = generateGqlQueries('OnBoardingStep', ON_BOARDING_STEP_FIELDS)

const CREATE_ONBOARDING_MUTATION = gql`
    mutation createOnBoardingByType ($data: CreateOnBoardingInput!) {
        result: createOnBoardingByType(data: $data) {
            id
        }
    }
`

/* AUTOGENERATE MARKER <CONST> */

module.exports = {
    OnBoarding,
    OnBoardingStep,
    CREATE_ONBOARDING_MUTATION,
/* AUTOGENERATE MARKER <EXPORTS> */
}
