import { TipTapContentAsJSON } from '../../TipTapTypes.js'
import { mergeThreadContents } from './mergeThreadContents.js'

describe('mergeThreadContents([a,b])', () => {
  describe('when b is the beginning of a ', () => {
    it('should return a', () => {
      const a: TipTapContentAsJSON = {
        type: 'doc',
        content: [
          { type: 'paragraph', content: [{ type: 'text', text: 'Test' }] },
          { type: 'paragraph', content: [{ type: 'text', text: 'Test 2' }] },
        ],
      }

      const b: TipTapContentAsJSON = {
        type: 'doc',
        content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Test' }] }],
      }

      const res = mergeThreadContents([a, b])

      expect(res.content).toHaveLength(2)
      expect(res.content[0]).toMatchObject(a.content[0])
      expect(res.content[1]).toMatchObject(a.content[1])
    })
  })

  describe('when a is the beginning of b', () => {
    it('should return b', () => {
      const a: TipTapContentAsJSON = {
        type: 'doc',
        content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Test' }] }],
      }

      const b: TipTapContentAsJSON = {
        type: 'doc',
        content: [
          { type: 'paragraph', content: [{ type: 'text', text: 'Test' }] },
          { type: 'paragraph', content: [{ type: 'text', text: 'Test 2' }] },
        ],
      }

      const res = mergeThreadContents([a, b])

      expect(res.content).toHaveLength(2)
      expect(res.content[0]).toMatchObject(b.content[0])
      expect(res.content[1]).toMatchObject(b.content[1])
    })
  })

  describe('when a and b do not start with the same content', () => {
    it('should return a then b contents joined by a paragraph node', () => {
      const a: TipTapContentAsJSON = {
        type: 'doc',
        content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Test 3' }] }],
      }

      const b: TipTapContentAsJSON = {
        type: 'doc',
        content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Test 2' }] }],
      }

      const res = mergeThreadContents([a, b])

      expect(res.content).toHaveLength(2)
      expect(res.content[0]).toMatchObject(a.content[0])
      expect(res.content[1]).toMatchObject({
        type: 'paragraph',
        content: [{ type: 'text', text: '--- Ci-dessous le contenu récupéré ---' }],
      })
      expect(res.content[2]).toMatchObject(b.content[1])
    })
  })
})
