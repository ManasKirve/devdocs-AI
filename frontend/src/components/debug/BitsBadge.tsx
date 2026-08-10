import { useEffect, useState } from 'react'
import { getMountedBits, subscribeBits } from '../../debug/registry'

export default function BitsBadge() {
  const [bits, setBits] = useState<string[]>(getMountedBits)

  useEffect(() => subscribeBits(() => setBits(getMountedBits())), [])

  if (!import.meta.env.DEV) return null

  return (
    <div
      style={{
        position: 'fixed',
        right: 12,
        bottom: 12,
        zIndex: 9999,
        background: 'rgba(0,0,0,0.85)',
        color: '#7ee787',
        font: '12px/1.5 ui-monospace, SFMono-Regular, Menlo, monospace',
        padding: '8px 12px',
        borderRadius: 8,
        border: '1px solid rgba(126,231,135,0.4)',
        maxWidth: 280,
      }}
    >
      <div style={{ fontWeight: 700, marginBottom: 4 }}>DEV bits mounted</div>
      {bits.length === 0 ? (
        <div style={{ color: '#ff7b72' }}>none</div>
      ) : (
        <ul style={{ margin: 0, paddingLeft: 16 }}>
          {bits.map((name) => (
            <li key={name}>{name}</li>
          ))}
        </ul>
      )}
    </div>
  )
}
