import React from 'react'
import { DomainEvent } from '../dependencies/addToHistory'

type FactViewerPageProps = {
  facts: DomainEvent[]
}

export const FactViewerPage = ({ facts }: FactViewerPageProps) => {
  return (
    <div style={{ padding: 30 }}>
      <ul style={{ borderLeft: '1px solid rgba(0,0,0,0.7)' }}>
        {facts.map(({ id, type, occurredAt, payload }) => (
          <li key={id} style={{ marginBottom: '10px', marginLeft: 20 }}>
            <details>
              <summary style={{ cursor: 'pointer' }}>
                <div style={{ display: 'inline-block', width: 180, color: 'rgba(0,0,0,0.5)' }}>
                  {occurredAt.toLocaleDateString()} à {occurredAt.toLocaleTimeString()}
                </div>{' '}
                <div style={{ display: 'inline-block', fontSize: 18 }}>{type}</div>
              </summary>
              <pre style={{ color: 'rgba(0,0,0,0.5)' }}>{JSON.stringify(payload, null, 2)}</pre>
            </details>
          </li>
        ))}
      </ul>
    </div>
  )
}
