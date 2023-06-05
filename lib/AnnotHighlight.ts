export class AnnotHighlight extends HTMLElement {

  #highlights: Map<string, [number, number, string | undefined]> = new Map()
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

  addHighlight (startWord: number, endWord: number, className?: string) {
    this.#highlights.set(startWord + '-' + endWord, [startWord, endWord, className])
    this.render()
  }

  removeHighlight (startWord: number, endWord: number) {
    this.#highlights.delete(startWord + '-' + endWord)
    this.render()
  }

  render () {
    if (this.#highlightsWrapper.children) this.#highlightsWrapper.innerHTML = ''
    for (const highlight of this.#highlights.values()) this.findAndDrawHighlight(...highlight)
  }

  findAndDrawHighlight (start: number, end: number, className: string | undefined) {
    const text = this.querySelector('annot-text') as Node
    
    const selection = window.getSelection()!
    selection.removeAllRanges()

    const range = new Range()
    range.setStart(text, 0)
    range.setEnd(text, 0)

    selection.addRange(range)

    const isChromium = !!(window as any).chrome

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

    this.drawHighlights(currentRange.getClientRects(), start, end, className)
  }

  drawHighlights (rects: DOMRectList, start: number, end: number, className: string | undefined) {
    const ownRect = this.getBoundingClientRect()
    const rectsArray = [...rects]

    const highlightWrapper = document.createElement('div')
    highlightWrapper.classList.add('highlight-group')
    this.#highlightsWrapper.appendChild(highlightWrapper)

    for (const [index, rect] of rectsArray.entries()) {
      const highlight = document.createElement('div')
      highlight.classList.add('highlight')
      if (className) highlight.classList.add(className)
      highlightWrapper.appendChild(highlight)

      const marginTop = ownRect.top
      const marginLeft = ownRect.left

      highlight.style.top = rect.y - marginTop + 'px'
      highlight.style.left = rect.x - marginLeft + 'px'
      highlight.style.height = rect.height + 'px'
      highlight.style.width = rect.width + 'px'

      let type = 'middle'

      if (index === 0) type = 'start'
      if (index === rectsArray.length - 1) type = 'end'

      this.dispatchEvent(new CustomEvent('draw-highlight', {
        detail: { element: highlight, type, start, end }
      }))
    }
  }
}

customElements.define('annot-highlight', AnnotHighlight)