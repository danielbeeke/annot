import { iterateNode } from './helpers/iterateNode'

type Highlight = [string, number, number]

export class AnnotHighlight extends HTMLElement {

  #highlights: Set<Highlight> = new Set()
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

  addHighlight (text: string, startWord: number, endWord: number) {
    this.#highlights.add([text, startWord, endWord])
    this.render()
  }

  render () {
    for (const child of this.#highlightsWrapper.children) child.remove()
    for (const highlight of this.#highlights.values()) this.findAndDrawHighlight(highlight)
  }

  findAndDrawHighlight (highlightTuple: Highlight) {
    const [highlight, start, end] = highlightTuple
    let range = new Range()
    let regex = RegExp(highlight, 'g')
    let match

    const selection = window.getSelection()!
    selection.removeAllRanges()

    while (match = regex.exec(this.textContent!)) {
      let it = iterateNode(this)
      let currentIndex = 0
      let result = it.next()

      while (!result.done) {
        if (match.index >= currentIndex && match.index < currentIndex + result.value.length) {
          range = new Range()
          range.setStart(result.value, match.index - currentIndex)
        }

        if (match.index + highlight.length >= currentIndex && match.index + highlight.length < currentIndex + result.value.length) {
          range.setEnd(result.value, match.index + highlight.length - currentIndex)
          selection.addRange(range)
          this.drawHighlights(range.getClientRects())
        }
        
        currentIndex += result.value.length
        result = it.next()
      }
    }

    console.log(selection.toString())

    selection.removeAllRanges()
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