'use client'

import { useEffect, useState } from 'react'
import { Reaction } from '@/types'
import ReactionAnimation from './ReactionAnimation'

interface Props {
  reaction: Reaction | null
  noMatch: boolean
  onClose: () => void
}

const REACTION_LABELS: Record<string, { label: string; icon: string }> = {
  precipitation: { label: 'Precipitation', icon: '🧪' },
  gas:           { label: 'Gas Evolution', icon: '💨' },
  explosion:     { label: 'Explosion',     icon: '💥' },
  combustion:    { label: 'Combustion',    icon: '🔥' },
  dissolution:   { label: 'Dissolution',  icon: '💧' },
  color_change:  { label: 'Color Change', icon: '🌈' },
  none:          { label: 'No Reaction',  icon: '😶' },
}

export default function ResultModal({ reaction, noMatch, onClose }: Props) {
  const [visible, setVisible] = useState(false)
  const [animDone, setAnimDone] = useState(false)

  useEffect(() => {
    if (reaction || noMatch) {
      setVisible(true)
      setAnimDone(false)
    }
  }, [reaction, noMatch])

  const close = () => {
    setVisible(false)
    setTimeout(onClose, 300)
  }

  if (!visible) return null

  const meta = reaction ? REACTION_LABELS[reaction.reaction_type] : null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
      onClick={close}
    >
      <div
        className="relative bg-gray-900 border border-gray-700 rounded-3xl p-6 max-w-lg w-full mx-4 shadow-2xl"
        onClick={e => e.stopPropagation()}
        style={{ boxShadow: reaction ? `0 0 60px ${reaction.color}44` : undefined }}
      >
        <button
          onClick={close}
          className="absolute top-4 right-4 text-gray-500 hover:text-white transition-colors text-xl"
        >✕</button>

        {noMatch && !reaction ? (
          <div className="text-center py-8">
            <div className="text-5xl mb-4">🤷</div>
            <h2 className="text-white text-xl font-bold mb-2">No Reaction</h2>
            <p className="text-gray-400 text-sm">No known reaction for this combination.</p>
          </div>
        ) : reaction ? (
          <>
            {/* Animation */}
            <div className="rounded-xl overflow-hidden mb-4 bg-gray-950">
              <ReactionAnimation reaction={reaction} onDone={() => setAnimDone(true)} />
            </div>

            {/* Result info */}
            <div className="flex items-start gap-4">
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0"
                style={{ backgroundColor: reaction.color + '33', border: `2px solid ${reaction.color}66` }}
              >
                {meta?.icon}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <span
                    className="text-xs px-2 py-0.5 rounded-full font-medium"
                    style={{ backgroundColor: reaction.color + '33', color: reaction.color }}
                  >
                    {meta?.label}
                  </span>
                  {reaction.is_pubchem && (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-blue-900/50 text-blue-300 font-medium">
                      PubChem
                    </span>
                  )}
                </div>
                <h2 className="text-white text-2xl font-black">{reaction.product_formula}</h2>
                <p className="text-gray-300 text-base font-medium">{reaction.product_name}</p>
              </div>
            </div>

            {/* Color swatch */}
            <div className="mt-4 flex items-center gap-3">
              <div
                className="w-8 h-8 rounded-full border-2 border-gray-700 flex-shrink-0"
                style={{ backgroundColor: reaction.color }}
              />
              <span className="text-gray-400 text-sm">Color: <span className="font-mono text-gray-300">{reaction.color}</span></span>
            </div>
          </>
        ) : null}
      </div>
    </div>
  )
}
