
declare global {
  namespace Cypress {
    interface Chainable {
      openBankTransfer(): Chainable<JQuery<HTMLElement>>
      setRoleFromFixture(key: string): Chainable<void>
      setRole(role: string): Chainable<void>
      fillTransferFromFixture(fixtureKey: string, opts?: { mode?: 'instant'|'scheduled', date?: string }): Chainable<void>
      fillBeneficiary(name: string): Chainable<JQuery<HTMLElement>>
      fillIban(iban: string): Chainable<JQuery<HTMLElement>>
      fillLabel(label: string): Chainable<JQuery<HTMLElement>>
      fillAmount(amount: string): Chainable<JQuery<HTMLElement>>
      setMode(mode: 'instant'|'scheduled'): Chainable<void>
      setDate(value: string): Chainable<JQuery<HTMLElement>>
      shouldSeeMessageContains(text: string): Chainable<JQuery<HTMLElement>>
    }
  }
  interface Window {
    __setRole?: (role: string) => void
    __ROLE__?: string
  }
}

import S from './selectors'
// simple date utilities to keep steps DRY
export const addDays = (days: number): string => {
  const d = new Date()
  d.setDate(d.getDate() + days)
  return d.toISOString().split('T')[0]
}

Cypress.Commands.add('openBankTransfer', (): Cypress.Chainable<JQuery<HTMLElement>> => {
  cy.visit('/')
  return cy.get(S.form)
})

export {}

// helper: set role from fixture key
Cypress.Commands.add('setRoleFromFixture', (key: string) => {
  cy.fixture('users.json').then(users => {
    // Accept either a fixture key (e.g. 'admin') or a role name (e.g. 'Administrator')
    let role = 'Guest'
    if(users[key] && users[key].role) {
      role = users[key].role
    } else {
      // try to find a user that has this role value
      const match = Object.values(users).find((u: any) => (u as any).role === key)
      if(match && (match as any).role) role = (match as any).role
      else role = key // fallback to the provided string
    }
    cy.window().then((win: Window & { __setRole?: (r: string) => void }) => { win.__setRole && win.__setRole(role) })
  })
})

// helper: set role directly
Cypress.Commands.add('setRole', (role: string) => {
  cy.window().then((win: Window & { __setRole?: (r: string) => void }) => { win.__setRole && win.__setRole(role) })
})

// helper: fill transfer from fixture key (instant or scheduled)
Cypress.Commands.add('fillTransferFromFixture', (fixtureKey: string, opts?: { mode?: 'instant'|'scheduled', date?: string }) => {
  cy.fixture('bank_transfer.json').then(f => {
    const v = f[fixtureKey]
    // use composable helpers
    cy.fillBeneficiary(v.beneficiary)
    cy.fillIban(v.iban)
    cy.fillLabel(v.label)
    cy.fillAmount(v.amount)
    cy.setMode(opts?.mode || 'instant')
    if(opts?.date) cy.setDate(opts.date)
  })
})

// composable helpers
Cypress.Commands.add('fillBeneficiary', (name: string) => cy.get(S.beneficiary).clear().type(name))
Cypress.Commands.add('fillIban', (iban: string) => cy.get(S.iban).clear().type(iban))
Cypress.Commands.add('fillLabel', (label: string) => cy.get(S.label).clear().type(label))
Cypress.Commands.add('fillAmount', (amount: string) => cy.get(S.amount).clear().type(amount))
Cypress.Commands.add('setMode', (mode: 'instant'|'scheduled') => {
  if(mode === 'scheduled') cy.get(S.modeScheduled).check()
  else cy.get(S.modeInstant).check()
})
Cypress.Commands.add('setDate', (value: string) => {
  return cy.get(S.transferDate).then($el => {
    cy.wrap($el).invoke('val', value).trigger('input').trigger('change')
    return cy.wrap($el)
  })
})

// assertion helper: visible message contains text
Cypress.Commands.add('shouldSeeMessageContains', (text: string) => {
  return cy.get(S.message, { timeout: 10000 }).should(($m) => {
    const t = ($m.text() || '').trim()
    expect(t).to.contain(text)
  })
})
