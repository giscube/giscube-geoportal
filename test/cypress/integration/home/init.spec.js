describe('Landing', () => {
  beforeEach(() => {
    cy.visit('/')
  })
  it('.should() - assert that <title> contains Geoportal', () => {
    cy.title().should('include', 'Geoportal')
  })
})
