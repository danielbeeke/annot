describe('add highlight', () => {
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

describe('load highlight', () => {
  it('passes', () => {
    cy.visit('http://localhost:5173/demo/index.html#add-fixtures', {
      onBeforeLoad(win) {
        cy.stub(win.console, 'log').as('log')
      }    
    })

    cy.get('@log').should('be.calledWith', { start: 2, end: 3, className: "test1", text: "dolor sit" })
    cy.get('@log').should('be.calledWith', { start: 5, end: 5, className: "test2", text: "consectetur" })

  })
})