describe('highlight', () => {
  it('passes', () => {
    cy.visit('http://localhost:5173/demo/index.html')

    cy.get('html').realClick({ x: 130, y: 20 })
    cy.get('html').realClick({ x: 280, y: 20 })

    // cy.get('html').realClick({ x: 30, y: 60 })
    // cy.get('html').realClick({ x: 130, y: 60 })


  })
})