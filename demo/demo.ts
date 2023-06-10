import '../lib/AnnotText'
import '../lib/AnnotHighlight'

import type { AnnotText } from '../lib/AnnotText'
import type { AnnotHighlight } from '../lib/AnnotHighlight'

const annotText = document.querySelector('annot-text')! as AnnotText
const annotHighlight = document.querySelector('annot-highlight')! as AnnotHighlight

if (location.hash === '#add-fixtures') {
  annotHighlight.addHighlight(2, 3, 'test1')
  annotHighlight.addHighlight(5, 5, 'test2')
}

annotHighlight.addEventListener('click-highlight', (event: any) => {
  alert(event.detail.text)
})

annotText.addEventListener('selection', (event: any) => {
  const start = event.detail.start
  const end = event.detail.end

  const startChapter = parseInt(event.detail.startNode.parentElement.closest('[chapter]').getAttribute('chapter'))
  const endChapter = parseInt(event.detail.endNode.parentElement.closest('[chapter]').getAttribute('chapter'))

  console.log(startChapter, endChapter)

  const colorDialog = document.getElementById('colorDialog')! as any
  const color = colorDialog.querySelector('#color')
  const confirmBtn = colorDialog.querySelector('#confirmBtn')
  
  let chosenColor = '#ddd'

  const close = () => {
    annotText.clearCursors()
    confirmBtn.removeEventListener('click', click, { once: true })
  }

  const click = (event: any) => {
    event.preventDefault()
    chosenColor = color.value
    colorDialog.close()

    annotHighlight.addHighlight(start, end, undefined, chosenColor)
    annotText.clearCursors()
    colorDialog.removeEventListener('close', close, { once: true })
  }

  colorDialog.addEventListener('close', close, { once: true })
  confirmBtn.addEventListener('click', click, { once: true })

  colorDialog.showModal()
})

const highlights = annotHighlight.getHighlights()
for (const highlight of highlights) {
  console.log(highlight)
}
