'use client'

import { useState, useRef, useEffect } from 'react'
import CookingResultModal from '@/components/CookingResultModal'
import { POPULAR_INGREDIENTS, searchIngredients, type Ingredient } from '@/lib/ingredients'

interface CookingResult {
  id: string
  name: string
  category: string
  area: string
  thumbnail: string
  matched_count: number
  total_selected: number
  missing_count: number
  ingredients: string[]
  ready_in_minutes?: number
  servings?: number
}

export default function CookingPage() {
  const [selected, setSelected] = useState<Ingredient[]>([])
  const [query, setQuery] = useState('')
  const [suggestions, setSuggestions] = useState<Ingredient[]>([])
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<CookingResult | null>(null)
  const [noMatch, setNoMatch] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    setSuggestions(searchIngredients(query))
  }, [query])

  const addIngredient = (ing: Ingredient) => {
    if (selected.some(s => s.en === ing.en)) return
    setSelected(prev => [...prev, ing])
    setQuery('')
    setSuggestions([])
    inputRef.current?.focus()
  }

  const removeIngredient = (en: string) => {
    setSelected(prev => prev.filter(s => s.en !== en))
  }

  const handleMix = async () => {
    if (selected.length < 2) return
    setLoading(true)
    setResult(null)
    setNoMatch(false)

    try {
      const params = selected.map(s => s.en).join(',')
      const res = await fetch(`/api/cooking?ingredients=${encodeURIComponent(params)}`)
      const data = await res.json()
      if (data?.id) setResult(data)
      else setNoMatch(true)
      setShowModal(true)
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-gray-950 text-white">
      <div className="max-w-3xl mx-auto px-4 py-8 flex flex-col gap-8">

        {/* 검색 */}
        <section>
          <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-3">
            재료 검색
          </h2>
          <div className="relative">
            <div className="flex items-center gap-2 bg-gray-900 border border-gray-700 rounded-2xl px-4 py-3 focus-within:border-orange-500 transition-colors">
              <span className="text-gray-500">🔍</span>
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={e => setQuery(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter' && suggestions.length > 0) addIngredient(suggestions[0])
                }}
                placeholder="재료를 검색하세요 (예: 달걀, Chicken...)"
                className="flex-1 bg-transparent text-white placeholder-gray-500 outline-none text-sm"
              />
            </div>

            {/* 자동완성 드롭다운 */}
            {suggestions.length > 0 && query && (
              <ul className="absolute top-full left-0 right-0 mt-1 bg-gray-800 border border-gray-700 rounded-2xl overflow-hidden z-20 shadow-xl">
                {suggestions.map(s => (
                  <li key={s.en}>
                    <button
                      onClick={() => addIngredient(s)}
                      className="w-full text-left px-4 py-2.5 hover:bg-gray-700 transition-colors text-sm flex items-center justify-between"
                    >
                      <span className="text-white">{s.ko}</span>
                      <span className="text-gray-500 text-xs">{s.en}</span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>

        {/* 선택된 재료 + Mix It */}
        <section className="bg-gray-900 border border-gray-700 rounded-2xl p-5 flex flex-col gap-4">
          <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-widest">선택한 재료</h2>

          {selected.length === 0 ? (
            <p className="text-gray-600 text-sm text-center py-3">재료를 검색하거나 아래에서 선택하세요</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {selected.map(ing => (
                <div
                  key={ing.en}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-orange-900/30 border border-orange-700/40 text-sm"
                >
                  <span className="text-white font-medium">{ing.ko}</span>
                  <span className="text-gray-500 text-xs">{ing.en}</span>
                  <button
                    onClick={() => removeIngredient(ing.en)}
                    className="text-gray-500 hover:text-red-400 transition-colors ml-1"
                  >✕</button>
                </div>
              ))}
            </div>
          )}

          <button
            onClick={handleMix}
            disabled={selected.length < 2 || loading}
            className={`
              w-full py-4 rounded-2xl font-black text-lg tracking-wider transition-all duration-200
              ${selected.length >= 2 && !loading
                ? 'bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-500 hover:to-red-500 text-white shadow-lg shadow-orange-900/50 hover:scale-[1.02] active:scale-[0.98]'
                : 'bg-gray-800 text-gray-600 cursor-not-allowed'
              }
            `}
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                </svg>
                레시피 찾는 중...
              </span>
            ) : 'MIX IT 🍳'}
          </button>
        </section>

        {/* 인기 재료 */}
        <section className="flex flex-col gap-5">
          <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-widest">
            인기 재료
          </h2>
          {POPULAR_INGREDIENTS.map(cat => (
            <div key={cat.category}>
              <p className="text-xs text-gray-500 mb-2">{cat.emoji} {cat.category}</p>
              <div className="flex flex-wrap gap-2">
                {cat.items.map(ing => {
                  const isSelected = selected.some(s => s.en === ing.en)
                  return (
                    <button
                      key={ing.en}
                      onClick={() => isSelected ? removeIngredient(ing.en) : addIngredient(ing)}
                      className={`px-3 py-1.5 rounded-xl text-sm font-medium transition-all duration-150 border ${
                        isSelected
                          ? 'bg-orange-600 border-orange-500 text-white'
                          : 'bg-gray-800 border-gray-700 text-gray-300 hover:border-orange-600 hover:text-white'
                      }`}
                    >
                      {ing.ko}
                    </button>
                  )
                })}
              </div>
            </div>
          ))}
        </section>
      </div>

      {showModal && (
        <CookingResultModal
          result={result}
          noMatch={noMatch}
          onClose={() => { setShowModal(false); setResult(null); setNoMatch(false) }}
        />
      )}
    </main>
  )
}
