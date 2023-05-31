import '../lib/AnnotText'
import '../lib/AnnotHighlight'

import type { AnnotText } from '../lib/AnnotText'
import type { AnnotHighlight } from '../lib/AnnotHighlight'

const annotText = document.querySelector('annot-text')! as AnnotText
const annotHighlight = document.querySelector('annot-highlight')! as AnnotHighlight

annotHighlight.addHighlight('Lorem', 6, 6)

annotText.addEventListener('selection', (event: any) => {
  const text = event.detail.text
  annotHighlight.addHighlight(text, 6, 6)
  annotText.clearCursors()
})