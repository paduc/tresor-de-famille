import { Project, ReferenceEntry, Node } from 'ts-morph'

export function getFacts(project: Project) {
  const baseMakeDomainEvent = getMakeDomainEvent(project)

  const fileWithDomainEvent = new Set<string>()

  for (const baseEventReference of findReferences(baseMakeDomainEvent)) {
    fileWithDomainEvent.add(baseEventReference.getNode().getSourceFile().getFilePath())
  }

  return Array.from(fileWithDomainEvent)
}

function getDomainEvent(project: Project) {
  const baseDomainEventFile = project.getSourceFileOrThrow('DomainEvent.ts')

  const baseDomainEventLine = baseDomainEventFile.getStatementOrThrow(
    (stmt) =>
      stmt
        .getChildren()
        // @ts-ignore
        .findIndex((child) => child.compilerNode.escapedText === 'DomainEvent') !== -1
  )

  const baseDomainEvent = baseDomainEventLine
    .getChildren()
    // @ts-ignore
    .find((child) => child.compilerNode.escapedText === 'DomainEvent')

  if (!baseDomainEvent) {
    throw new Error('Could not find BaseDomainEvent')
  }

  return baseDomainEvent
}

function getMakeDomainEvent(project: Project) {
  const baseDomainEventFile = project.getSourceFileOrThrow('DomainEvent.ts')

  const descendants = baseDomainEventFile.getDescendants()

  // @ts-ignore
  const makeDomainEventNode = descendants.find((d) => d.compilerNode.escapedText === 'makeDomainEvent')

  return makeDomainEventNode
}

function findReferences(node: Node | undefined) {
  const references: ReferenceEntry[] = []

  if (node && Node.isReferenceFindable(node)) {
    const referenceSymbols = node.findReferences()

    for (const referenceSymbol of referenceSymbols) {
      for (const reference of referenceSymbol.getReferences()) {
        if (reference.getSourceFile().getFilePath() !== node.getSourceFile().getFilePath()) {
          references.push(reference)
        }
      }
    }
  }

  return references
}
