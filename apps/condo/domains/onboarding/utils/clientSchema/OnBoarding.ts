/**
 * Generated by `createschema onboarding.OnBoarding 'completed:Checkbox; stepsTransitions:Json;'`
 */

import {
    OnBoarding,
    OnBoardingCreateInput,
    OnBoardingUpdateInput,
    QueryAllOnBoardingsArgs,
} from '@app/condo/schema'

import { generateReactHooks } from '@open-condo/codegen/generate.hooks'

import { OnBoarding as OnBoardingGQL } from '@condo/domains/onboarding/gql'

const {
    useObject,
    useObjects,
    useCreate,
    useUpdate,
    useSoftDelete,
} = generateReactHooks<OnBoarding, OnBoardingCreateInput, OnBoardingUpdateInput, QueryAllOnBoardingsArgs>(OnBoardingGQL)

export {
    useObject,
    useObjects,
    useCreate,
    useUpdate,
    useSoftDelete,
}
