describe('add specific highlight', () => {
  it('passes', () => {
    cy.visit('http://localhost:5173/demo/index.html', {
      onBeforeLoad(win) {
        cy.stub(win.console, 'log').as('log')
      }
    })

    cy.get('annot-text').should(($annotText) => {
      const annotHighlight = $annotText[0].parentElement as any
      const words = $annotText.text().trim().split(/\W/g).filter(Boolean)

      annotHighlight.addHighlight(23, 24)
      expect(annotHighlight.getHighlights()[0].text.replace(/\W/g, '')).equal(words.slice(23, 25).join(''))
      annotHighlight.removeHighlight(23, 24)
    })

  })
})

describe('add all highlights', () => {
  it.only('passes', () => {
    cy.visit('http://localhost:5173/demo/index.html', {
      onBeforeLoad(win) {
        cy.stub(win.console, 'log').as('log')
      }
    })

    cy.get('annot-text').should(($annotText) => {
      const words = $annotText.text().trim().split(/ |\n|\,|\./g).filter(Boolean)
      const annotHighlight = $annotText[0].parentElement as any

      const start = 25
      const wordSlice = [...words.slice(start, 26)]

      for (const [index, word] of wordSlice.entries()) {
        annotHighlight.addHighlight(start + index, start + index)
        const [ highlight ] = annotHighlight.getHighlights()
        expect(highlight.text).equal(word)
        annotHighlight.removeHighlight(start + index, start + index)
      }
    })

    // cy.get('annot-text').should(($annotText) => {
    //   const words = $annotText.text().trim().split(/ |\n|\,|\./g).filter(Boolean)
    //   const annotHighlight = $annotText[0].parentElement as any

    //   for (let i = 0; i < words.length; i = i + 2) {
    //     annotHighlight.addHighlight(i, i + 1)
    //     const [ highlight ] = annotHighlight.getHighlights()

    //     expect(highlight.text).contain(words[i])
    //     expect(highlight.text).contain(words[i + 1])
    //     expect(highlight.text.length).to.be.above(words[i].length + words[i + 1].length)

    //     annotHighlight.removeHighlight(i, i + 1)
    //   } 
    // })
  })
})
