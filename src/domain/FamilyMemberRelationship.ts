const relationsWithoutSide = ['father', 'mother', 'son', 'daughter', 'brother', 'sister'] as const

export function isRelationWithoutSide(relationship: any): relationship is typeof relationsWithoutSide[number] {
  return relationsWithoutSide.includes(relationship)
}

const relationsWithSide = ['grandfather', 'grandmother', 'uncle', 'aunt'] as const

export function isRelationWithSide(relationship: any): relationship is typeof relationsWithSide[number] {
  return relationsWithSide.includes(relationship)
}

export type FamilyMemberRelationship =
  | {
      relationship: 'father'
    }
  | {
      relationship: 'mother'
    }
  | {
      relationship: 'son'
    }
  | {
      relationship: 'daughter'
    }
  | {
      relationship: 'brother'
    }
  | {
      relationship: 'sister'
    }
  | {
      relationship: 'husband'
    }
  | {
      relationship: 'wife'
    }
  | {
      relationship: 'cousin'
    }
  | {
      relationship: 'grandfather'
      side?: 'paternal' | 'maternal'
    }
  | {
      relationship: 'grandmother'
      side?: 'paternal' | 'maternal'
    }
  | {
      relationship: 'uncle'
      side?: 'paternal' | 'maternal'
    }
  | {
      relationship: 'aunt'
      side?: 'paternal' | 'maternal'
    }
  | {
      relationship: 'friend'
      precision?: string
    }
  | {
      relationship: 'coworker'
      precision?: string
    }
  | {
      relationship: 'other'
      precision: string
    }

export const isValidFamilyMemberRelationship = (relation: any): relation is FamilyMemberRelationship => {
  return !!relation && !!relation.relationship && typeof relation.relationship === 'string'
}

export const traduireRelation = (relation: FamilyMemberRelationship): string => {
  switch (relation.relationship) {
    case 'father':
      return 'ton père'
    case 'son':
      return 'ton fils'
    case 'brother':
      return 'ton frère'
    case 'mother':
      return 'ta mère'
    case 'sister':
      return 'ta soeur'
    case 'daughter':
      return 'ta fille'
    case 'wife':
      return 'ta femme'
    case 'husband':
      return 'ton mari'
    case 'cousin':
      return 'ton/ta cousin(e)'
    case 'grandfather':
      return `ton grand-père${relation.side ? (relation.side === 'maternal' ? ' maternel' : ' paternel') : ''}`
    case 'grandmother':
      return `ta grand-mère${relation.side ? (relation.side === 'maternal' ? ' maternelle' : ' paternelle') : ''}`
    case 'uncle':
      return `ton oncle${relation.side ? (relation.side === 'maternal' ? ' maternel' : ' paternel') : ''}`
    case 'aunt':
      return `ta tante${relation.side ? (relation.side === 'maternal' ? ' maternelle' : ' paternelle') : ''}`
    case 'coworker':
      return `un collègue${relation.precision ? ` (${relation.precision})` : ''}`
    case 'friend':
      return `un ami${relation.precision ? ` (${relation.precision})` : ''}`
    case 'other':
      return relation.precision
  }
}
