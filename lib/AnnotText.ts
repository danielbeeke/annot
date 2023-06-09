import type { AnnotCursor } from './AnnotCursor'
import './AnnotCursor'

const SPLIT = / |\n|\,|\./g

export class AnnotText extends HTMLElement {

  #startCursor: AnnotCursor | undefined
  #endCursor: AnnotCursor | undefined

  async connectedCallback () {
    this.addEventListener('click', (event: any) => {
      const lineHeight = parseInt(window.getComputedStyle(event.target).lineHeight)
      if (this.#startCursor && !this.#endCursor) {
        if (this.#endCursor) this.removeCursor('end')
        this.#endCursor = this.createCursor('end', lineHeight)

        const { start, end, sentence } = this.cursorsToSpanInformation()
        const event = new CustomEvent('selection', { detail: { 
          start, end, sentence, 
          startNode: this.#startCursor.node, 
          endNode: this.#endCursor.node }})
        
        this.dispatchEvent(event)
      } 
      else {
        if (this.#startCursor) this.removeCursor('start')
        if (this.#endCursor) this.removeCursor('end')
        this.#startCursor = this.createCursor('start', lineHeight)
      }
    })
  }

  cursorsToSpanInformation () {
    const iterator = document.createNodeIterator(this, NodeFilter.SHOW_TEXT)

    let node = iterator.nextNode()
    let start = 0
    let end = 0

    let encounteredStartNode = false
    let encounteredEndNode = false

    if (!this.#startCursor) throw new Error('Missing start cursor')
    if (!this.#endCursor) throw new Error('Missing end cursor')

    let sentence: string = ''

    while (node) {

      // Words before the start cursor, counting for 'start'
      if (node !== this.#startCursor.node && !encounteredStartNode) {
        const chunkWords = node.textContent!.split(SPLIT).filter(Boolean)
        start += chunkWords.length
      }

      // Counting words before the offset, this chunk does contain the text but might not start with it.
      if (node === this.#startCursor.node && !encounteredStartNode) {
        const chunkWords = this.#startCursor.node.textContent.substring(0, this.#startCursor.offset)!.split(SPLIT).filter(Boolean)

        const end = this.#startCursor.node === this.#endCursor.node ? 
          this.#endCursor.offset : // Cut till the end offset
          this.#startCursor.node.textContent.length // Get everything

        sentence = this.#startCursor.node.textContent.substring(this.#startCursor.offset, end)

        start += chunkWords.length
        encounteredStartNode = true
      }

      // If we are in a chunk in the middle, add it to the sentence
      if (node !== this.#startCursor.node && node !== this.#endCursor.node && encounteredStartNode && !encounteredEndNode) {
        sentence += node.textContent!
      }

      // If we are at the end.
      if (node === this.#endCursor.node) {
        if (node !== this.#startCursor.node) {
          sentence += this.#endCursor.node.textContent.substring(0, this.#endCursor.offset)  
        }

        const sentenceWords = sentence.split(SPLIT).filter(Boolean)
        end = start - 1 + sentenceWords.length
        encounteredEndNode = true
      }

      node = iterator.nextNode()
    }

    return { start: start, end, sentence }
  }

  createCursor (type: 'start' | 'end', height: number) {
    const cursor = document.createElement('annot-cursor') as AnnotCursor
    cursor.setAttribute('type', type)
    cursor.setAttribute('style', `--lineHeight: ${height}px;`)
    this.appendChild(cursor)
    return cursor
  }
  
  removeCursor (cursorName: 'start' | 'end') {
    const cursor = cursorName === 'start' ? this.#startCursor : this.#endCursor
    cursor?.remove()
    if (cursorName === 'start') this.#startCursor = undefined
    else this.#endCursor = undefined
  }

  clearCursors () {
    if (this.#startCursor) this.removeCursor('start')
    if (this.#endCursor) this.removeCursor('end')

  }
}

customElements.define('annot-text', AnnotText)