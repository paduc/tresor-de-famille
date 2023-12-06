import React from 'react'
import { DomainEvent } from '../../dependencies/DomainEvent'

type FactViewerPageProps = {
  facts: DomainEvent[]
  factTypes: string[]
  query: string | undefined
}

export const FactViewerPage = ({ facts, factTypes, query }: FactViewerPageProps) => {
  return (
    <div style={{ padding: 30 }}>
      <div style={{ backgroundColor: 'rgba(0,0,50,0.1)', padding: '20px 30px' }}>
        <div style={{ fontSize: 32 }}>Fact Viewer 2000</div>
        <a href='./factDiagram.html'>Diagram</a>
      </div>
      <div style={{ backgroundColor: 'rgba(0,0,50,0.05)', padding: '10px 30px' }}>
        <details>
          <summary style={{ cursor: 'pointer', marginBottom: 10 }}>Filters</summary>

          <form method='GET'>
            <label htmlFor='type'>By type</label>
            <select multiple name='type' size={20} style={{ resize: 'vertical', display: 'block', marginBottom: 10 }}>
              {factTypes.map((type) => (
                <option key={type}>{type}</option>
              ))}
            </select>
            <button type='submit' style={{ padding: '5px 10px', background: 'white', border: '1px solid rgba(0, 0, 0, 0.5)' }}>
              Filter
            </button>
            <a href='?' style={{ marginLeft: 10 }}>
              Reset
            </a>
          </form>
        </details>
      </div>
      <div style={{ backgroundColor: 'rgba(0,0,50,0.05)', padding: '10px 30px', marginBottom: 20 }}>
        <form method='GET' className='inline-flex items-center'>
          <input type='text' name='query' defaultValue={query || ''} />
          <button type='submit' className='px-3 py-1.5 mx-1 bg-white border border-gray-500'>
            Search
          </button>
          <a href='?' style={{ marginLeft: 10 }}>
            Reset
          </a>
        </form>
      </div>
      <ul style={{ borderLeft: '1px solid rgba(0,0,0,0.7)' }}>
        {facts.map(({ id, type, occurredAt, payload }) => (
          <li key={id} style={{ marginBottom: '10px', marginLeft: 20 }}>
            <details>
              <summary style={{ cursor: 'pointer' }}>
                <div style={{ display: 'inline-block', width: 250, color: 'rgba(0,0,0,0.5)' }}>
                  {occurredAt.toLocaleDateString()} à {occurredAt.toLocaleTimeString()}
                </div>{' '}
                <div style={{ display: 'inline-block', fontSize: 18 }}>{type}</div>
              </summary>
              <pre style={{ color: 'rgba(0,0,0,0.5)' }}>
                {JSON.stringify(
                  type === 'AWSDetectedFacesInPhoto'
                    ? { faces: payload.faces.map(({ faceId }: any) => ({ faceId })), photoId: payload.photoId }
                    : payload,
                  null,
                  2
                )}
                {/* {JSON.stringify(payload, null, 2)} */}
              </pre>
            </details>
          </li>
        ))}
      </ul>
    </div>
  )
}
