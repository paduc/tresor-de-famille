import React from 'react'

type FactDiagramPageProps = {
  files: string[]
}

export const FactDiagramPage = ({ files }: FactDiagramPageProps) => {
  return (
    <div style={{ padding: 30 }}>
      <div style={{ backgroundColor: 'rgba(0,0,50,0.1)', padding: '20px 30px' }}>
        <div style={{ fontSize: 32 }}>Fact Diagrammer 3000</div>
      </div>
      <ul style={{ borderLeft: '1px solid rgba(0,0,0,0.7)' }}>
        {files.map((file) => (
          <li key={file}>{file}</li>
        ))}
      </ul>
    </div>
  )
}
