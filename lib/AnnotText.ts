import type { AnnotCursor } from './AnnotCursor'
import './AnnotCursor'
import './style.scss'

export class AnnotText extends HTMLElement {

  #startCursor: AnnotCursor | undefined
  #endCursor: AnnotCursor | undefined

  async connectedCallback () {
    this.addEventListener('click', () => {
      if (this.#startCursor && !this.#endCursor) {
        if (this.#endCursor) this.removeCursor('end')
        this.#endCursor = this.createCursor('end')
        const range = document.createRange()

        range.setStart(this.#startCursor.node, this.#startCursor.offset ?? 0)
        range.setEnd(this.#endCursor.node, this.#endCursor.offset ?? 0)

        const event = new CustomEvent('selection', { detail: { 
          range,
          text: range.toString()
        }})
        this.dispatchEvent(event)
      } 
      else {
        if (this.#startCursor) this.removeCursor('start')
        if (this.#endCursor) this.removeCursor('end')
        this.#startCursor = this.createCursor('start')
      }
    })
  }

  createCursor (type: 'start' | 'end') {
    const cursor = document.createElement('annot-cursor') as AnnotCursor
    cursor.setAttribute('type', type)
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