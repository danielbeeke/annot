import debounce from 'lodash-es/debounce'
import { iterateNode } from './helpers/iterateNode'

type Highlight = [number, number, boolean | undefined, string | undefined, string | undefined]

export class AnnotHighlight extends HTMLElement {

  #highlights: Map<string, Highlight> = new Map()
  #highlightsWrapper: HTMLDivElement

  constructor () {
    super()
    this.#highlightsWrapper = document.createElement('div')
    this.#highlightsWrapper.classList.add('highlights')

    const originalRender = this.render.bind(this)
    this.render = debounce(originalRender, 40)
  }

  connectedCallback () {
    this.insertAdjacentElement('afterbegin', this.#highlightsWrapper)
    window.addEventListener('resize', () => this.render())
    this.render()
  }

  addHighlight (startWord: number, endWord: number, removable?: boolean, className?: string, color?: string) {
    this.#highlights.set(startWord + '-' + endWord, [startWord, endWord, removable, className, color])
    this.render()
  }

  removeHighlight (startWord: number, endWord: number) {
    this.#highlights.delete(startWord + '-' + endWord)
    this.render()
  }

  getHighlights () {
    return [...this.#highlights.values()].map(([start, end, removable, className, color]: Highlight) => {
      const range = this.highlightToRange(start, end)
      return { start, end, className, color, removable, text: range.toString().trim() }
    })
  }

  render () {
    const needed: Array<string> = []
    const existingIds: Array<string> = [...this.#highlightsWrapper.children]
      .map((highlight) => (highlight as HTMLDivElement).dataset.highlight)
      .filter(Boolean) as Array<string>

    for (const [start, end, removable, className, color] of this.#highlights.values()) {
      const id = `${start}-${end}-${className}-${color}`

      if (!existingIds.includes(id)) {
        this.findAndDrawHighlight(start, end, removable, className, color)
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

  highlightToRange1 (start: number, end: number): Range {
    const text = this.querySelector('annot-text')!
    const words = text.textContent!.trim().split(' ')
    const wordPositions: Set<number> = new Set()

    let counter = 0
    for (const word of words) {
      if (word && !['\n'].includes(word)) wordPositions.add(counter)
      if (!['\n'].includes(word)) counter += word.length + 1
    }

    const wordKeys: Array<number> = [...wordPositions.values()]

    const startCharacter = wordKeys[start]
    const endCharacter = wordKeys[end + 1] - 1

    const range = new Range()
    range.setStart(text, 0)
    range.setEnd(text, 0)

    console.log(startCharacter, endCharacter)

    const selection = window.getSelection()!
    selection.addRange(range)

    for (let i = 0; i <= startCharacter; i++) {
      selection.modify('move', 'forward', 'character')
    }

    for (let i = startCharacter; i <= endCharacter; i++) {
      selection.modify('extend', 'forward', 'character')
    }


    // // selection.removeAllRanges()

    return range
  }


  highlightToRange (start: number, end: number): Range {
    const text = this.querySelector('annot-text')!
    const range = new Range()
    // const selection = window.getSelection()!
    // selection.addRange(range)

    const iterator = document.createNodeIterator(text, NodeFilter.SHOW_TEXT)
    let node = iterator.nextNode()

    const wordPositions: Map<number, any> = new Map()

    let startIsSet = false
    let endIsSet = false

    while (node) {
      const words = node.textContent!.trim().split(' ')

      let index = 0
      for (const word of words) {
        if (word.replace(/\W/g, '')) wordPositions.set(wordPositions.size, { node, word, index })
        index += word.length + 1
      }

      // If we have added the word that is the start
      if (!startIsSet && wordPositions.has(start)) {
        const { node: startNode, word: startWord, index: startIndex } = wordPositions.get(start)
        range.setStart(startNode, startIndex)
        startIsSet = true
      }

      // If we have added the word that is the end
      if (!endIsSet && wordPositions.has(end)) {
        const { node: endNode, word: endWord, index: endIndex } = wordPositions.get(end)
        range.setEnd(endNode, endIndex + endWord.replace(/\W/g, '').length)
        endIsSet = true
      }
  
      node = startIsSet && endIsSet ? null : iterator.nextNode()
    }

    return range
  }

  findAndDrawHighlight (start: number, end: number, removable?: boolean, className?: string | undefined, color?: string | undefined) {
    const range = this.highlightToRange(start, end)
    const rects = [...range.getClientRects()].filter(rect => rect.width)
    this.drawHighlights(rects, start, end, range.toString(), removable, className, color)
  }

  drawHighlights (rectsArray: Array<DOMRect>, start: number, end: number, text: string, removable?: boolean, className?: string | undefined, color?: string | undefined) {
    const ownRect = this.getBoundingClientRect()

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

      if (removable && type === 'end') this.addRemoveButton(highlight, rect, start, end)
    }
  }

  addRemoveButton (element: HTMLDivElement, rect: DOMRect, start: number, end: number) {
    const ownRect = this.getBoundingClientRect()

    const removeButton = document.createElement('button')
    removeButton.innerHTML = 'x'
    removeButton.classList.add('remove-button')

    const marginTop = ownRect.top
    const marginLeft = ownRect.left

    removeButton.style.top = rect.y - marginTop + 'px'
    removeButton.style.left = rect.x + rect.width - marginLeft + 'px'

    element.parentElement!.appendChild(removeButton)

    removeButton.addEventListener('click', () => {
      this.removeHighlight(start, end)
    })
  }
}

customElements.define('annot-highlight', AnnotHighlight)