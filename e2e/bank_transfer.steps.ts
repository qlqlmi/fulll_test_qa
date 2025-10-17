import { Given, When, Then } from '@badeball/cypress-cucumber-preprocessor'
import S from './support/selectors'
import { addDays } from './support/commands'

Given('the bank transfer page is open', () => {
  cy.openBankTransfer()
})

When('I set my role to {string}', (role: string) => {
  cy.setRole(role)
})

When('I fill the form with valid instant transfer data', () => {
  cy.fillTransferFromFixture('validInstant', { mode: 'instant' })
})

When('I choose scheduled transfer mode', () => {
  cy.setMode('scheduled')
  cy.get(S.dateLabel).should('not.have.class', 'hidden')
})

When('I set the transfer date to tomorrow', () => {
  cy.setDate(addDays(1))
})

When('I fill the rest of the form with valid data', () => {
  cy.fillTransferFromFixture('validScheduled', { mode: 'scheduled' })
})

When('I submit the form', () => {
  cy.get(S.submit).should('be.enabled').click()
})

Then('I should see a success message', () => {
  cy.shouldSeeMessageContains('Transfer created successfully')
})

When('I fill the form with IBAN {string}', (iban: string) => {
  cy.fillBeneficiary('Alice GmbH')
  cy.fillIban(iban)
  cy.fillLabel('Invoice')
  cy.fillAmount('50.00')
})

Then('I should see an invalid message', () => {
  cy.shouldSeeMessageContains('Invalid')
})

Then('I should see an access denied message', () => {
  cy.shouldSeeMessageContains('Access denied')
})

When('I fill the form with amount {string}', (amount: string) => {
  cy.fillBeneficiary('Alice GmbH')
  cy.fillIban('DE89370400440532013000')
  cy.fillLabel('Invoice')
  cy.fillAmount(amount)
})
When('I fill the form with label {string}', (label: string) => {
  cy.fillBeneficiary('Alice GmbH')
  cy.fillIban('DE89370400440532013000')
  cy.fillLabel(label)
  cy.fillAmount('10.00')
})

Then('I should see {string} message', (expected: string) => {
  cy.shouldSeeMessageContains(expected)
})

When('I fill the scheduled form with date {string}', (which: string) => {
  const value = which === 'tomorrow' ? addDays(1) : which === 'yesterday' ? addDays(-1) : which
  cy.setMode('scheduled')
  // role is set by scenario steps; avoid overriding here to keep reuse
  cy.fillBeneficiary('InExtenso')
  cy.fillIban('FR7630006000011234567890189')
  cy.fillLabel('Scheduled Invoice')
  cy.fillAmount('42.00')
  cy.get(S.transferDate).clear().type(value).blur()
  cy.get(S.transferDate).should('have.value', value)
})
