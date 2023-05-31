import { getCorrection } from './helpers/getCorrection'

export class AnnotCursor extends HTMLElement {

  #selection: Selection | undefined | null
  #type: 'start' | 'end' | undefined
  #offset: number | undefined
  #node: any

  get node () {
    return this.#node
  }

  get offset () {
    return this.#offset
  }

  connectedCallback () {
    this.#selection = document.getSelection()
    this.#type = this.getAttribute('type') as 'start' | 'end'
    this.setInitialPosition()
  }

  setInitialPosition () {
    if (this.#type === 'start') {
      this.#selection?.modify('move', 'forward', 'word')
      this.#selection?.modify('move', 'backward', 'word')
    }

    if (this.#type === 'end') {
      this.#selection?.modify('move', 'backward', 'word')
      this.#selection?.modify('move', 'forward', 'word')
      this.#selection?.modify('extend', 'backward', 'character')
      const range = this.#selection!.getRangeAt(0)

      if (![',', '.', ':', ';'].includes(range.toString())) {
        this.#selection?.modify('move', 'forward', 'character')
      }
      else {
        this.#selection?.collapseToStart()
      }
    }

    this.#offset = this.#selection?.anchorOffset
    this.#node = this.#selection?.anchorNode

    const range = this.#selection!.getRangeAt(0)
    const { top, left } = range.getBoundingClientRect()
    const { marginLeft, marginTop } = getCorrection(this)
    this.style.top = top - marginTop + 'px'
    this.style.left = left - marginLeft + 'px'
  }
}

customElements.define('annot-cursor', AnnotCursor)