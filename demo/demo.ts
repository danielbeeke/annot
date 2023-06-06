import '../lib/AnnotText'
import '../lib/AnnotHighlight'

import type { AnnotText } from '../lib/AnnotText'
import type { AnnotHighlight } from '../lib/AnnotHighlight'

const annotText = document.querySelector('annot-text')! as AnnotText
const annotHighlight = document.querySelector('annot-highlight')! as AnnotHighlight

annotHighlight.addHighlight(10, 13, 'test')
annotHighlight.addHighlight(17, 18, 'test2')

annotHighlight.addEventListener('click-highlight', (event: any) => {
  alert(event.detail.text)
})

annotText.addEventListener('selection', (event: any) => {
  const start = event.detail.start
  const end = event.detail.end

  annotHighlight.addHighlight(start, end)
  annotText.clearCursors()
})