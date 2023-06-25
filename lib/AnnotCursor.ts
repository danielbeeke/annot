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

    // Edge case triggered by Cypress
    if (!this.#selection!.rangeCount) return 

    const range = this.#selection!.getRangeAt(0)
    const { top, left, height } = range.getBoundingClientRect()

    const ownRect = this.closest('annot-text')!.parentElement!.getBoundingClientRect()

    const ownMarginTop = ownRect.top
    const ownMarginLeft = ownRect.left

    this.style.top = top - ownMarginTop + 'px'
    this.style.left = left - ownMarginLeft + 'px'
    this.style.height = height + 'px'
  }
}

customElements.define('annot-cursor', AnnotCursor)