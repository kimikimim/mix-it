'use client'

import { useState, useCallback } from 'react'
import PeriodicTable from '@/components/PeriodicTable'
import SelectedPanel from '@/components/SelectedPanel'
import ResultModal from '@/components/ResultModal'
import { supabase } from '@/lib/supabase'
import { buildHillFormula, inferReactionType, inferAnimation, inferColor } from '@/lib/inferReaction'
import { Element, SelectedElement, Reaction } from '@/types'

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
      const symbols = selected.map(s => s.symbol).sort()

      // ── 1단계: 로컬 Supabase DB 조회 ──────────────────
      const { data } = await supabase
        .from('reactions')
        .select('*')
        .contains('elements', symbols)
        .containedBy('elements', symbols)

      let found: Reaction | null = null

      if (data && data.length > 0) {
        const symbolsSet = new Set(symbols)
        const candidates = data.filter((r: Reaction) =>
          r.elements.length === symbols.length &&
          r.elements.every((e: string) => symbolsSet.has(e))
        )
        if (candidates.length > 0) {
          const selMap = Object.fromEntries(selected.map(s => [s.symbol, s.quantity]))
          const ratioMatch = candidates.find((r: Reaction) =>
            r.elements.every((e: string, i: number) => r.ratios[i] === selMap[e])
          )
          found = ratioMatch || candidates[0]
        }
      }

      // ── 2단계: PubChem API fallback ────────────────────
      if (!found) {
        const formula = buildHillFormula(selected)
        try {
          const res = await fetch(`/api/pubchem?formula=${encodeURIComponent(formula)}`)
          const pubchem = await res.json()

          if (pubchem?.formula) {
            const reactionType = inferReactionType(symbols, selected.map(s => s.quantity))
            found = {
              id: `pubchem-${pubchem.cid}`,
              elements: symbols,
              ratios: selected.map(s => s.quantity),
              product_formula: pubchem.formula,
              product_name: pubchem.common_name || pubchem.iupac_name,
              reaction_type: reactionType,
              animation: inferAnimation(reactionType),
              color: inferColor(symbols, selected.map(s => s.quantity)),
              is_pubchem: true,
            } as Reaction
          }
        } catch {
          // PubChem 실패 시 조용히 무시
        }
      }

      if (found) {
        setReaction(found)
      } else {
        setNoMatch(true)
      }
      setShowModal(true)
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-gray-950 text-white">
      <header className="border-b border-gray-800 px-6 py-4 flex items-center gap-3">
        <div className="text-2xl font-black tracking-tight">
          <span className="text-violet-400">mix</span>
          <span className="text-fuchsia-400">.it</span>
        </div>
        <span className="text-gray-500 text-sm">원소를 섞어보세요 ⚗️</span>
      </header>

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
            주기율표 — 원소를 클릭해서 선택 (최대 6종)
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
