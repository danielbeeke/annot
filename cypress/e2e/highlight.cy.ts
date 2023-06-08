describe('highlight', () => {
  it('passes', () => {
    cy.visit('http://localhost:5173/demo/index.html', {
      onBeforeLoad(win) {
        cy.stub(win.console, 'log').as('log')
      }    
    })

    cy.get('html').realClick({ x: 130, y: 20 })
    cy.get('html').realClick({ x: 280, y: 20 })

    cy.get('@log').should('be.calledWith', {start: 3, end: 6, sentence: 'sit amet, consectetur adipiscing'})

  })
})