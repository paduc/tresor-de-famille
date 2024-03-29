import { Project, ReferenceEntry, Node, SourceFile } from 'ts-morph'
import { FactDiagramPageProps } from './FactDiagramPage.js'
import path from 'node:path'

type EventDTO = FactDiagramPageProps['events'][number]
export function getFacts(project: Project) {
  const baseMakeDomainEvent = getMakeDomainEvent(project)

  const events: EventDTO[] = []

  const references = findReferences(baseMakeDomainEvent)

  const uniqueSourceFiles = new Set<string>()

  for (const baseEventReference of references) {
    const sourceFile = baseEventReference.getNode().getSourceFile()
    const filePath = sourceFile.getFilePath()

    if (uniqueSourceFiles.has(filePath)) continue

    uniqueSourceFiles.add(filePath)

    const relativePath = path.relative(process.cwd(), filePath)

    const event = parsePath(relativePath)

    addCallsites(sourceFile, event)

    events.push(event)
  }

  return Array.from(events.values())
}

function addCallsites(sourceFile: SourceFile, event: EventDTO) {
  const eventConstructor = getEventConstructor(sourceFile)
  const callsToConstructor = findReferences(eventConstructor).filter((ref) => ref.getNode().getParent()?.getKind() === 212)

  event.callsites = callsToConstructor.map((c) => ({
    filePath: path.relative(process.cwd(), c.getSourceFile().getFilePath()),
    fileName: path.basename(c.getSourceFile().getFilePath()),
    line: c.getNode().getStartLineNumber(),
  }))
}

function getEventConstructor(sourceFile: SourceFile) {
  return (
    sourceFile
      .getDescendants()
      // @ts-ignore
      .find((d) => d.compilerNode.escapedText === 'makeDomainEvent' && d.getParent()?.compilerNode.kind === 212)
      ?.getParent()
      ?.getParent()
      ?.getChildrenOfKind(80)
      .shift()
  )
}

function parsePath(filePath: string): FactDiagramPageProps['events'][number] {
  const parsed = path.parse(filePath)

  // Extract the eventName, which is the base name of the file
  const eventName = parsed.name

  // Check if the path is a page path by looking for 'pages' in the path
  const isPage = parsed.dir.includes('pages')

  let page, subfolders
  if (isPage) {
    // The path is in the form 'src/pages/page/subfolders/file', so we split on '/'
    const parts = parsed.dir.split('/')

    // The 'page' is the third part of the path
    page = parts[2]

    // The 'subfolders' are everything after 'page', joined by '/'
    subfolders = parts.slice(3).join('/')

    return {
      eventName,
      isPage,
      page,
      subfolders,
      fullPath: filePath,
      callsites: [],
    }
  }

  return {
    eventName,
    fullPath: filePath,
    isPage,
    callsites: [],
  }
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
