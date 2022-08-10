import { publish } from '../../dependencies/eventStore'

import { resetDatabase } from '../../dependencies/__test__/resetDatabase'

import { getParents, getSpouse, getChildren, getSiblings } from './getPersoInfo.query'

describe('getPersonInfo', () => {
  describe('When the person page is loaded', () => {
    it("should return the person's parents list", () => {
      expect(
        getParents(
          ['123', '345', '134'],
          [
            { name: 'Blabla', id: '123' },
            { name: 'Jacques', id: '345' },
            { name: 'Paul', id: '3675' },
          ]
        )
      ).toEqual(
        expect.arrayContaining([
          { name: 'Blabla', id: '123' },
          { name: 'Jacques', id: '345' },
        ])
      )
    })
  })
  it("sould return the person's children list", () => {
    expect(
      getChildren(
        [
          { childId: '123', parentId: '456' },
          { childId: '546', parentId: '456' },
          { childId: '890', parentId: '123' },
        ],
        [
          { name: 'Blabla', id: '123' },
          { name: 'Jacques', id: '546' },
          { name: 'Pierre', id: '789' },
          { name: 'Paul', id: '908' },
          { name: 'Boule', id: '298' },
          { name: 'Bill', id: '607' },
        ],
        '456'
      )
    ).toEqual(
      expect.arrayContaining([
        { name: 'Blabla', id: '123' },
        { name: 'Jacques', id: '546' },
      ])
    )
  })

  it("Should return the person's spouse list", () => {
    expect(
      getSpouse(
        // first argument, array of children
        [
          { name: 'enfant1', id: '2345' },
          { name: 'enfant2', id: '5246' },
        ],
        // second argument, array of relationShip
        [
          { childId: '2345', parentId: '456' },
          { childId: '5246', parentId: '456' },
          { childId: '5246', parentId: '123' },
        ],

        // third argument, array of Person
        [
          { name: 'Blabla', id: '123' },
          { name: 'Jacques', id: '456' },
          { name: 'Pierre', id: '789' },
          { name: 'Paul', id: '908' },
          { name: 'Boule', id: '298' },
          { name: 'Bill', id: '607' },
        ],

        // fourth argument, one person
        { name: 'Blabla', id: '123' }
      )
    ).toEqual(expect.arrayContaining([{ name: 'Jacques', id: '456' }]))
  })

  it("Should return the person's siblings list", () => {
    expect(
      getSiblings(
        // parentsIds
        ['123', '567', '789'],
        // relationShips
        [
          { childId: '2345', parentId: '567' }, //
          { childId: '123', parentId: '789' },
          { childId: '5246', parentId: '123' }, //
        ],
        // Person
        { name: 'Blabla', id: '123' },

        // Persons
        [
          { name: 'Blabla', id: '2345' },
          { name: 'Jacques', id: '5246' },
          { name: 'Pierre', id: '789' },
          { name: 'Paul', id: '908' },
          { name: 'Boule', id: '298' },
          { name: 'Bill', id: '607' },
        ]
      )
    ).toEqual(
      expect.arrayContaining([
        { name: 'Blabla', id: '2345' },
        { name: 'Jacques', id: '5246' },
      ])
    )
  })
})
