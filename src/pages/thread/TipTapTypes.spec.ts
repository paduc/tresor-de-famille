import { PhotoNode, TipTapContentAsJSON, removeSeparatorNodes } from './TipTapTypes'

describe('removeEmptySpaceBetweenPhotos', () => {
  describe('when there is a photoNode, a separatorNode and a empty paragraph', () => {
    const content: TipTapContentAsJSON = {
      type: 'doc',
      content: [
        {
          type: 'photoNode',
          attrs: {} as PhotoNode['attrs'],
        },
        {
          type: 'separatorNode',
        },
        {
          type: 'paragraph',
          content: [],
        },
      ],
    }

    it('should remove the separatorNode', () => {
      const res = removeSeparatorNodes(content)
      expect(res).toMatchObject({
        type: 'doc',
        content: [
          {
            type: 'photoNode',
            attrs: {} as PhotoNode['attrs'],
          },
          {
            type: 'paragraph',
            content: [],
          },
        ],
      })
    })
  })
})
