import { PhotoNode, TipTapContentAsJSON, removeEmptySpaceBetweenPhotos } from './TipTapTypes'

describe('removeEmptySpaceBetweenPhotos', () => {
  describe('when there is a photoNode, a empty paragraph and another photoNode', () => {
    const content: TipTapContentAsJSON = {
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
        {
          type: 'photoNode',
          attrs: {} as PhotoNode['attrs'],
        },
      ],
    }

    it('should remove the empty paragraph', () => {
      const res = removeEmptySpaceBetweenPhotos(content)
      expect(res).toMatchObject({
        type: 'doc',
        content: [
          {
            type: 'photoNode',
            attrs: {} as PhotoNode['attrs'],
          },
          {
            type: 'photoNode',
            attrs: {} as PhotoNode['attrs'],
          },
        ],
      })
    })
  })

  describe('when there is a photoNode, a non-empty paragraph and another photoNode', () => {
    const content: TipTapContentAsJSON = {
      type: 'doc',
      content: [
        {
          type: 'photoNode',
          attrs: {} as PhotoNode['attrs'],
        },
        {
          type: 'paragraph',
          content: [{ type: 'text', text: 'something' }],
        },
        {
          type: 'photoNode',
          attrs: {} as PhotoNode['attrs'],
        },
      ],
    }

    it('should leave all nodes', () => {
      const res = removeEmptySpaceBetweenPhotos(content)
      expect(res).toMatchObject(content)
    })
  })

  describe('when there is a photoNode-empty paragraph-photoNode-empty paragraph-photoNode', () => {
    const content: TipTapContentAsJSON = {
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
        {
          type: 'photoNode',
          attrs: {} as PhotoNode['attrs'],
        },
        {
          type: 'paragraph',
          content: [],
        },
        {
          type: 'photoNode',
          attrs: {} as PhotoNode['attrs'],
        },
      ],
    }

    it('should remove bother empty paragraphs', () => {
      const res = removeEmptySpaceBetweenPhotos(content)
      expect(res).toMatchObject({
        type: 'doc',
        content: [
          {
            type: 'photoNode',
            attrs: {} as PhotoNode['attrs'],
          },
          {
            type: 'photoNode',
            attrs: {} as PhotoNode['attrs'],
          },
          {
            type: 'photoNode',
            attrs: {} as PhotoNode['attrs'],
          },
        ],
      })
    })
  })

  describe('when there is a empty paragraph-photoNode-empty paragraph-photoNode-empty paragraph-photoNode-empty paragraph', () => {
    const content: TipTapContentAsJSON = {
      type: 'doc',
      content: [
        {
          type: 'paragraph',
          content: [],
        },
        {
          type: 'photoNode',
          attrs: {} as PhotoNode['attrs'],
        },
        {
          type: 'paragraph',
          content: [],
        },
        {
          type: 'photoNode',
          attrs: {} as PhotoNode['attrs'],
        },
        {
          type: 'paragraph',
          content: [],
        },
      ],
    }

    it('should only remove the empty paragraph between photoNodes', () => {
      const res = removeEmptySpaceBetweenPhotos(content)
      expect(res).toMatchObject({
        type: 'doc',
        content: [
          {
            type: 'paragraph',
            content: [],
          },
          {
            type: 'photoNode',
            attrs: {} as PhotoNode['attrs'],
          },
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
