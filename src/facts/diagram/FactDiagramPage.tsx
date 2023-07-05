import React from 'react'

type EventDTO = {
  eventName: string
  fullPath: string
} & (
  | {
      isPage: true
      page: string
      subfolders: string
    }
  | {
      isPage: false
    }
)

export type FactDiagramPageProps = {
  events: EventDTO[]
}

export const FactDiagramPage = ({ events }: FactDiagramPageProps) => {
  const pageEvents = events.filter((event): event is EventDTO & { isPage: true } => event.isPage)

  type PageName = string

  type SubfolderName = string

  const eventsByPageAndSubfolder = pageEvents.reduce((pageMap, event) => {
    if (!pageMap.has(event.page)) {
      pageMap.set(event.page, new Map<SubfolderName, EventDTO[]>())
    }

    if (!pageMap.get(event.page)?.has(event.subfolders)) {
      pageMap.get(event.page)?.set(event.subfolders, [])
    }

    pageMap.get(event.page)?.get(event.subfolders)?.push(event)

    return pageMap
  }, new Map<PageName, Map<SubfolderName, EventDTO[]>>())

  return (
    <div style={{ padding: 30 }}>
      <div style={{ backgroundColor: 'rgba(0,0,50,0.1)', padding: '20px 30px' }}>
        <div style={{ fontSize: 32 }}>Fact Diagrammer 3000</div>
      </div>
      From pages:
      <ul style={{ borderLeft: '1px solid rgba(0,0,0,0.7)' }}>
        {Array.from(eventsByPageAndSubfolder.keys())
          .sort()
          .map((page: string) => {
            return (
              <li key={page}>
                <div>{page}</div>
                <ul>
                  {Array.from(eventsByPageAndSubfolder.get(page)!.keys())
                    .sort()
                    .map((subfolder) => {
                      return (
                        <li key={subfolder}>
                          <div>{subfolder}</div>
                          <ul>
                            {eventsByPageAndSubfolder
                              .get(page)!
                              .get(subfolder)!
                              .map((event) => {
                                return <li key={event.eventName}>{event.eventName}</li>
                              })}
                          </ul>
                        </li>
                      )
                    })}
                </ul>
              </li>
            )
          })}
      </ul>
      From elsewhere:
      <ul style={{ borderLeft: '1px solid rgba(0,0,0,0.7)' }}>
        {events
          .filter((event): event is EventDTO & { isPage: false } => !event.isPage)
          .map((event) => (
            <li key={event.fullPath}>{event.eventName}</li>
          ))}
      </ul>
    </div>
  )
}
