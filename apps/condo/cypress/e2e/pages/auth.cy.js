import { faker } from '@faker-js/faker'

import { SignIn, ForgotPassword, Registration }  from '../../objects/Auth'
import { SimpleTracer } from '../../objects/helpers'

describe('Auth scenarios', () => {

    describe('User', () => {
        it('can start password recovery', () => {
            const tracer = new SimpleTracer('auth.user.canStartPasswordRecovery')
            const span = tracer.startSpan('1.startPasswordRecovery')
            cy.task('keystone:createUser').then(([, user]) => {
                const forgot = new ForgotPassword()
                forgot
                    .visit()
                    .fillPhone(user.phone)
                    .startPasswordRecoveryClick()
            })
            span.finish()
        })
        it('can signin with correct password and phone', () => {
            const tracer = new SimpleTracer('auth.user.canSigninWithCorrectPasswordAndPhone')
            const span = tracer.startSpan('1.signIn')
            cy.task('keystone:createUser').then(([, user]) => {
                const signIn = new SignIn()
                signIn
                    .visit()
                    .fillPhone(user.phone)
                    .fillPassword(user.password)
                    .signinClick()
            })
            span.finish()
        })
    })
    describe('Anonymous', () => {
        it('can register after confirming phone', () => {

            const tracer = new SimpleTracer('auth.anonymous.canRegisterAfterConfirmingPhone')
            const registrationSpan = tracer.startSpan('1.loadingRegistration')

            const registration = new Registration()
            const user = {
                phone: faker.phone.number('+7922#######'),
                password: faker.internet.password(),
                email: faker.internet.email(),
                name: `${faker.name.firstName()} ${faker.name.lastName()}`,
            }
            // step 1
            registration
                .visit()
                .fillPhone(user.phone)
                .startRegistrationClick()
            cy.url().should('contain', 'step=validatePhone')
            registrationSpan.finish()

            const getConfirmPhoneActionSpan = tracer.startSpan('2.completingRegistration')
            cy.task('keystone:getConfirmPhoneAction', user.phone).then(([{ smsCode }]) => {
                // step 2
                registration.fillSMSCode(smsCode)
                // step 3
                registration
                    .fillName(user.name)
                    .fillEmail(user.email)
                    .fillPassword(user.password)
                    .fillConfirmPassword(user.password)
                    .completeRegistrationClick()
            })
            getConfirmPhoneActionSpan.finish()
        })
    })
})
