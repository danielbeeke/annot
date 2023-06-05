import '../lib/AnnotText'
import '../lib/AnnotHighlight'

import type { AnnotText } from '../lib/AnnotText'
import type { AnnotHighlight } from '../lib/AnnotHighlight'

const annotText = document.querySelector('annot-text')! as AnnotText
const annotHighlight = document.querySelector('annot-highlight')! as AnnotHighlight

annotText.addEventListener('selection', (event: any) => {
  const start = event.detail.start
  const end = event.detail.end

  annotHighlight.addHighlight(start, end)
  annotText.clearCursors()
})