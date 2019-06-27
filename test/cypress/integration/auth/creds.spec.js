describe('Auth by credentials', () => {

  beforeEach(() => {
    cy.visit('/#/auth')
  })

  it('Try logging in without any credentials', () => {
    cy.get('.no-login').contains('Log in').click()
    cy.get('.no-login .q-field__messages > div').should('exist')
  })

  it('Try logging in with wrong credentials', () => {
    cy.get('.no-login').get('input[name="username"]').type('not-a-user')
    cy.get('.no-login').get('input[name="password"]').type('not-a-password')
    cy.get('.no-login').contains('Log in').click()
    cy.get('.no-login .q-form > span.text-negative').should('exist')
  })


  it('Log in correctly', () => {
    cy.fixture('credentials').then(credentials => {
      cy.get('.no-login').get('input[name="username"]').type(credentials.username)
      cy.get('.no-login').get('input[name="password"]').type(credentials.password)
      cy.get('.no-login').contains('Log in').click()
      cy.get('.valid-login').should('contain', credentials.username)
      cy.get('.valid-login').contains('Log out').click()
    })
  })
})
