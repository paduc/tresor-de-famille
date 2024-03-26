import { TipTapContentAsJSON, TipTapJSON } from '../../TipTapTypes'

export function mergeThreadContents([a, b]: [TipTapContentAsJSON, TipTapContentAsJSON]): TipTapContentAsJSON {
  if (!a.content.length) {
    return b
  }

  if (!b.content.length) {
    return a
  }
  let i = 0
  for (; i < Math.min(a.content.length, b.content.length); i++) {
    if (!areNodesIdentical([a.content[i], b.content[i]])) {
      break
    }
  }

  return mergeNodesAt({ contents: [a, b], index: i })
}

function mergeNodesAt({
  contents: [a, b],
  index,
}: {
  contents: [TipTapContentAsJSON, TipTapContentAsJSON]
  index: number
}): TipTapContentAsJSON {
  const res: TipTapContentAsJSON = { type: 'doc', content: [] }

  // Copy up to the index
  for (let i = 0; i < index; i++) {
    res.content.push(a.content[i])
  }

  return res
}

function areNodesIdentical([a, b]: [TipTapJSON, TipTapJSON]) {
  if (a.type !== b.type) return false

  if (a.type === 'paragraph' && b.type === 'paragraph') {
    return JSON.stringify(a.content) === JSON.stringify(b.content)
  }

  if (a.type === 'photoNode' && b.type === 'photoNode') {
    return a.attrs.photoId === b.attrs.photoId
  }

  return false
}
