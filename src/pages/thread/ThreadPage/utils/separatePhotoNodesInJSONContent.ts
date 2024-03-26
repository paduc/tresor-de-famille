import { Editor } from '@tiptap/react'
import { TipTapContentAsJSON, TipTapJSON } from '../../TipTapTypes'

/**
 * Insert separators to facilitate edition of content
 * @param editor Editor instance
 */
export function addSeparatorBetweenNodes(editor: Editor) {
  const topContent = editor.view.state.doc.content

  // console.log('addSeparatorBetweenNodes', topContent)
  let currentSize = 0
  let childCount = topContent.childCount
  for (let i = 0; i < childCount; i++) {
    // console.log({
    //   i,
    //   childCount,
    //   prevChild: i > 0 ? topContent.child(i - 1).type.name : null,
    //   currChild: topContent.child(i).type.name,
    // })
    const previousNode = (i > 0 && topContent.child(i - 1)) || undefined
    const node = topContent.child(i)

    // Remove two successive seps
    if (previousNode && previousNode.type.name === 'separatorNode' && node.type.name === 'separatorNode') {
      const range = { from: currentSize, to: currentSize + node.nodeSize }
      // console.log('Found two successive separator nodes', range)
      editor.commands.deleteRange(range)
      return
    }

    // Remove when [para-sep]-para
    if (i < childCount - 1 && previousNode && previousNode.type.name === 'paragraph' && node.type.name === 'separatorNode') {
      const nextNode = topContent.child(i + 1)
      if (nextNode && nextNode.type.name === 'paragraph') {
        // Remove the separator
        const range = { from: currentSize, to: currentSize + node.nodeSize }
        // console.log('Found separator node between two paragraphs', range)
        editor.commands.deleteRange(range)
        return
      }
    }

    // Add separators between photo-para, or para-photo
    if (
      previousNode &&
      previousNode.type.name !== 'separatorNode' &&
      node.type.name !== 'separatorNode' &&
      (previousNode.type !== node.type || node.type.name === 'photoNode')
    ) {
      // console.log('Inserting separator', { previousNode: previousNode?.type.name, node: node.type.name })
      editor.chain().insertContentAt(currentSize, `<tdf-separator></tdf-separator>`).run()

      return // stop and wait for next run by editor.on('update')
    }

    // console.log('Doing nothing', { previousNode: previousNode?.type.name, node: node.type.name })
    currentSize += node.nodeSize
  }
}
/**
 * Same as above but for content as json (only for first print)
 * @param contentAsJSON
 */
export function separatePhotoNodesInJSONContent(contentAsJSON: TipTapContentAsJSON): TipTapContentAsJSON {
  const newContentAsJson: TipTapContentAsJSON = {
    type: 'doc',
    content: [],
  }

  let previousNode: TipTapJSON | null = null
  for (const node of contentAsJSON.content) {
    if (
      previousNode &&
      previousNode.type !== 'separatorNode' &&
      node.type !== 'separatorNode' &&
      (previousNode.type !== node.type || node.type === 'photoNode')
    ) {
      newContentAsJson.content.push({ type: 'separatorNode' })
    }
    newContentAsJson.content.push(node)
    previousNode = node
  }

  return newContentAsJson
}
