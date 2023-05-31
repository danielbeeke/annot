export function * iterateNode (topNode: Node): Generator<Text> {
  const childNodes = topNode.childNodes

  for (let i = 0; i < childNodes.length; i++) {
    let node = childNodes[i]
    if (node.nodeType === 3) {
      yield node as Text
    } else {
      yield* iterateNode(node)
    }
  }
}