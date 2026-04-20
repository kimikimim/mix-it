'use client'

import { useState, useCallback } from 'react'
import PeriodicTable from '@/components/PeriodicTable'
import SelectedPanel from '@/components/SelectedPanel'
import ResultModal from '@/components/ResultModal'
import { REACTIONS } from '@/lib/reactionsData'
import { buildHillFormula, inferReactionType, inferAnimation, inferColor } from '@/lib/inferReaction'
import { Element, SelectedElement, Reaction } from '@/types'

function findLocalReaction(selected: SelectedElement[]): Reaction | null {
  const symbols = selected.map(s => s.symbol).sort()
  const symbolsSet = new Set(symbols)
  const selMap = Object.fromEntries(selected.map(s => [s.symbol, s.quantity]))

  const candidates = REACTIONS.filter(r =>
    r.elements.length === symbols.length &&
    r.elements.every(e => symbolsSet.has(e))
  )

  if (!candidates.length) return null

  const ratioMatch = candidates.find(r =>
    r.elements.every((e, i) => r.ratios[i] === selMap[e])
  )
  const found = ratioMatch || candidates[0]
  return { ...found, id: found.product_formula }
}

export default function Home() {
  const [selected, setSelected] = useState<SelectedElement[]>([])
  const [loading, setLoading] = useState(false)
  const [reaction, setReaction] = useState<Reaction | null>(null)
  const [noMatch, setNoMatch] = useState(false)
  const [showModal, setShowModal] = useState(false)

  const handleSelect = useCallback((element: Element) => {
    setSelected(prev => {
      const exists = prev.find(s => s.symbol === element.symbol)
      if (exists) return prev.filter(s => s.symbol !== element.symbol)
      if (prev.length >= 6) return prev
      return [...prev, { symbol: element.symbol, quantity: 1 }]
    })
  }, [])

  const handleQuantityChange = useCallback((symbol: string, qty: number) => {
    setSelected(prev => prev.map(s => s.symbol === symbol ? { ...s, quantity: qty } : s))
  }, [])

  const handleRemove = useCallback((symbol: string) => {
    setSelected(prev => prev.filter(s => s.symbol !== symbol))
  }, [])

  const handleMix = async () => {
    if (selected.length < 2) return
    setLoading(true)
    setReaction(null)
    setNoMatch(false)

    try {
      // ── 1단계: 로컬 데이터 조회 ──────────────────────
      let found: Reaction | null = findLocalReaction(selected)

      // ── 2단계: PubChem API fallback ──────────────────
      if (!found) {
        const formula = buildHillFormula(selected)
        try {
          const res = await fetch(`/api/pubchem?formula=${encodeURIComponent(formula)}`)
          const pubchem = await res.json()

          if (pubchem?.formula) {
            const symbols = selected.map(s => s.symbol)
            const ratios = selected.map(s => s.quantity)
            const reactionType = inferReactionType(symbols, ratios)
            found = {
              id: `pubchem-${pubchem.cid}`,
              elements: symbols,
              ratios,
              product_formula: pubchem.formula,
              product_name: pubchem.common_name || pubchem.iupac_name,
              reaction_type: reactionType,
              animation: inferAnimation(reactionType),
              color: inferColor(symbols, ratios),
              is_pubchem: true,
            }
          }
        } catch {
          // PubChem 실패 시 조용히 무시
        }
      }

      if (found) setReaction(found)
      else setNoMatch(true)
      setShowModal(true)
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-gray-950 text-white">
      <div className="max-w-screen-2xl mx-auto px-4 py-6 flex flex-col gap-6">
        <SelectedPanel
          selected={selected}
          onQuantityChange={handleQuantityChange}
          onRemove={handleRemove}
          onMix={handleMix}
          loading={loading}
        />
        <section>
          <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-3">
            Periodic Table — Click elements to select (max 6 types)
          </h2>
          <PeriodicTable selected={selected} onSelect={handleSelect} />
        </section>
      </div>

      {showModal && (
        <ResultModal
          reaction={reaction}
          noMatch={noMatch}
          onClose={() => { setShowModal(false); setReaction(null); setNoMatch(false) }}
        />
      )}
    </main>
  )
}
