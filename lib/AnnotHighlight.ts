export class AnnotHighlight extends HTMLElement {

  #highlights: Set<[number, number]> = new Set()
  #highlightsWrapper: HTMLDivElement

  constructor () {
    super()
    this.#highlightsWrapper = document.createElement('div')
    this.#highlightsWrapper.classList.add('highlights')
  }

  connectedCallback () {
    this.insertAdjacentElement('afterbegin', this.#highlightsWrapper)
    window.addEventListener('resize', () => this.render())
    this.render()
  }

  addHighlight (startWord: number, endWord: number) {
    this.#highlights.add([startWord, endWord])
    this.render()
  }

  render () {
    for (const child of this.#highlightsWrapper.children) child.remove()
    for (const highlight of this.#highlights.values()) this.findAndDrawHighlight(...highlight)
  }

  findAndDrawHighlight (start: number, end: number) {
    const text = this.querySelector('annot-text') as Node
    
    const selection = window.getSelection()!
    selection.removeAllRanges()

    const range = new Range()
    range.setStart(text, 0)
    range.setEnd(text, 0)

    selection.addRange(range)

    /** @ts-ignore */
    const isChromium = !!window.chrome

    const words = text.textContent!.trim().split(/ |\,|\./g)

    let realWordIndex = -1

    for (const word of words) {
      if (word !== '') realWordIndex++
      if (word === '' && !isChromium) continue
      if (realWordIndex === start) break
      selection.modify('move', 'forward', 'word')
    }

    selection.modify('move', 'forward', 'word')    
    selection.modify('move', 'backward', 'word')

    realWordIndex = -1

    for (const word of words) {
      if (word !== '') realWordIndex++
      if (realWordIndex < start - 1) continue
      if (word === '' && !isChromium) continue
      if (realWordIndex === end) break
      selection.modify('extend', 'forward', 'word')
    }

    const testRange = selection.getRangeAt(0)
    const testRangeText = testRange.toString();

    const isLetter = /^[a-z]/i.test(testRangeText[testRangeText.length - 1])

    if (!isLetter) {
      selection.modify('extend', 'backward', 'character')    
    }

    const currentRange = selection.getRangeAt(0)

    selection.removeAllRanges()

    this.drawHighlights(currentRange.getClientRects())
  }

  drawHighlights (rects: DOMRectList) {
    const ownRect = this.getBoundingClientRect()

    for (const rect of rects) {
      const highlight = document.createElement('div')
      highlight.classList.add('highlight')
      this.#highlightsWrapper.appendChild(highlight)

      const marginTop = ownRect.top
      const marginLeft = ownRect.left

      highlight.style.top = rect.y - marginTop + 'px'
      highlight.style.left = rect.x - marginLeft + 'px'
      highlight.style.height = rect.height + 'px'
      highlight.style.width = rect.width + 'px'
    }
  }
}

customElements.define('annot-highlight', AnnotHighlight)