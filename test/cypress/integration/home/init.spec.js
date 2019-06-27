describe('Landing', () => {
  beforeEach(() => {
    cy.visit('/')
  })
  it('Assert that <title> contains Geoportal', () => {
    cy.title().should('include', 'Geoportal')
  })
})
