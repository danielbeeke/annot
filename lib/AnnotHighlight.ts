import * as _ from 'lodash-es'

export class AnnotHighlight extends HTMLElement {

  #highlights: Map<string, [number, number, string | undefined, string | undefined]> = new Map()
  #highlightsWrapper: HTMLDivElement

  constructor () {
    super()
    this.#highlightsWrapper = document.createElement('div')
    this.#highlightsWrapper.classList.add('highlights')

    const originalRender = this.render.bind(this)
    this.render = _.debounce(originalRender, 40)
  }

  connectedCallback () {
    this.insertAdjacentElement('afterbegin', this.#highlightsWrapper)
    window.addEventListener('resize', () => this.render())
    this.render()
  }

  addHighlight (startWord: number, endWord: number, className?: string, color?: string) {
    this.#highlights.set(startWord + '-' + endWord, [startWord, endWord, className, color])
    this.render()
  }

  removeHighlight (startWord: number, endWord: number) {
    this.#highlights.delete(startWord + '-' + endWord)
    this.render()
  }

  getHighlights () {
    return [...this.#highlights.values()].map(([start, end, className, color]: [number, number, string | undefined, string | undefined]) => {
      const range = this.highlightToRange(start, end)
      return { start, end, className, color, text: range.toString() }
    })
  }

  render () {
    const needed: Array<string> = []
    const existingIds: Array<string> = [...this.#highlightsWrapper.children]
      .map((highlight) => (highlight as HTMLDivElement).dataset.highlight)
      .filter(Boolean) as Array<string>

    for (const [start, end, className, color] of this.#highlights.values()) {
      const id = `${start}-${end}-${className}-${color}`

      if (!existingIds.includes(id)) {
        this.findAndDrawHighlight(start, end, className, color)
      }

      needed.push(id)
    }

    const idsToRemove = existingIds.filter((id: string) => !needed.includes(id))

    for (const child of this.#highlightsWrapper.children) {
      const id = (child as HTMLDivElement).dataset.highlight
      if (id && idsToRemove.includes(id)) {
        child.innerHTML = ''
        child.remove()
      }
    }
  }

  highlightToRange (start: number, end: number): Range {
    const text = this.querySelector('annot-text') as Node

    const selection = window.getSelection()!
    selection.removeAllRanges()

    const range = new Range()
    range.setStart(text, 0)
    range.setEnd(text, 0)

    selection.addRange(range)
    const isChromium = !!(window as any).chrome

    const words = text.textContent!.trim().split(/ |\,|\.|\n/g)
    let realWordIndex = -1

    // debugger

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
      selection.modify('extend', 'forward', 'word')
      if (realWordIndex === end) break
    }

    const testRange = selection.getRangeAt(0)
    const testRangeText = testRange.toString();

    const isLetter = /^[a-z]/i.test(testRangeText[testRangeText.length - 1])

    if (!isLetter) {
      selection.modify('extend', 'backward', 'character')    
    }

    const currentRange = selection.getRangeAt(0)
    selection.removeAllRanges()
    return currentRange
  }

  findAndDrawHighlight (start: number, end: number, className: string | undefined, color: string | undefined) {
    const range = this.highlightToRange(start, end)
    this.drawHighlights(range.getClientRects(), start, end, range.toString(), className, color)
  }

  drawHighlights (rects: DOMRectList, start: number, end: number, text: string, className?: string | undefined, color?: string | undefined) {
    const ownRect = this.getBoundingClientRect()
    const rectsArray = [...rects]

    const highlightWrapper = document.createElement('div')
    highlightWrapper.classList.add('highlight-group')
    this.#highlightsWrapper.appendChild(highlightWrapper)

    for (const [index, rect] of rectsArray.entries()) {
      const highlight = document.createElement('div')
      highlight.classList.add('highlight')
      if (className) highlight.classList.add(className)
      if (color) highlight.style.backgroundColor = color
      highlightWrapper.appendChild(highlight)

      const highlightHover = document.createElement('div')
      highlightHover.classList.add('highlight-hover')
      highlightWrapper.dataset.highlight = `${start}-${end}-${className}-${color}`
      highlightWrapper.appendChild(highlightHover)

      const marginTop = ownRect.top
      const marginLeft = ownRect.left

      highlight.style.top = rect.y - marginTop + 'px'
      highlight.style.left = rect.x - marginLeft + 'px'
      highlight.style.height = rect.height + 'px'
      highlight.style.width = rect.width + 'px'

      highlightHover.style.top = rect.y - marginTop + 'px'
      highlightHover.style.left = rect.x - marginLeft + 'px'
      highlightHover.style.height = rect.height + 'px'
      highlightHover.style.width = rect.width + 'px'

      highlightHover.addEventListener('click', () => {
        this.dispatchEvent(new CustomEvent('click-highlight', {
          detail: { element: highlight, type, start, end, text }
        }))
      })

      let type = 'middle'

      if (index === 0) type = 'start'
      if (index === rectsArray.length - 1) type = 'end'

      this.dispatchEvent(new CustomEvent('draw-highlight', {
        detail: { element: highlight, type, start, end }
      }))

      const isRemovable = this.getAttribute('removable') !== null
      if (isRemovable && type === 'end') this.addRemoveButton(highlight, start, end)
    }
  }

  addRemoveButton (element: HTMLDivElement, start: number, end: number) {
    const removeButton = document.createElement('button')
    removeButton.innerHTML = 'x'
    removeButton.classList.add('remove-button')
    const rect = element.getBoundingClientRect()

    removeButton.style.top = rect.y + 'px'
    removeButton.style.left = rect.x + rect.width + 'px'

    element.parentElement!.appendChild(removeButton)

    removeButton.addEventListener('click', () => {
      this.removeHighlight(start, end)
    })
  }
}

customElements.define('annot-highlight', AnnotHighlight)