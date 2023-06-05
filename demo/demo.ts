import '../lib/AnnotText'
import '../lib/AnnotHighlight'

import type { AnnotText } from '../lib/AnnotText'
import type { AnnotHighlight } from '../lib/AnnotHighlight'

const annotText = document.querySelector('annot-text')! as AnnotText
const annotHighlight = document.querySelector('annot-highlight')! as AnnotHighlight

annotHighlight.addEventListener('draw-highlight', (event: any) => {
  if (event.detail.type === 'end') {
    const removeButton = document.createElement('button')
    removeButton.innerHTML = 'x'
    removeButton.classList.add('remove-button')
    const rect = event.detail.element.getBoundingClientRect()

    removeButton.style.top = rect.y + 'px'
    removeButton.style.left = rect.x + rect.width + 'px'

    event.detail.element.parentElement.appendChild(removeButton)

    removeButton.addEventListener('click', () => {
      annotHighlight.removeHighlight(event.detail.start, event.detail.end)
    })
  }
})

annotHighlight.addHighlight(10, 13, 'test')
annotHighlight.addHighlight(17, 18, 'test2')

annotText.addEventListener('selection', (event: any) => {
  const start = event.detail.start
  const end = event.detail.end

  annotHighlight.addHighlight(start, end)
  annotText.clearCursors()
})