'use client'

import { SelectedElement } from '@/types'
import { getElementBySymbol } from '@/lib/elements'

interface Props {
  selected: SelectedElement[]
  onQuantityChange: (symbol: string, qty: number) => void
  onRemove: (symbol: string) => void
  onMix: () => void
  loading: boolean
}

export default function SelectedPanel({ selected, onQuantityChange, onRemove, onMix, loading }: Props) {
  return (
    <div className="bg-gray-900 border border-gray-700 rounded-2xl p-5 flex flex-col gap-4">
      <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-widest">선택한 원소</h2>

      {selected.length === 0 ? (
        <p className="text-gray-600 text-sm text-center py-4">주기율표에서 원소를 선택하세요 (최대 3개)</p>
      ) : (
        <div className="flex flex-wrap gap-3">
          {selected.map(({ symbol, quantity }) => {
            const el = getElementBySymbol(symbol)
            return (
              <div
                key={symbol}
                className="flex items-center gap-2 px-3 py-2 rounded-xl border"
                style={{ borderColor: el?.color + '88', backgroundColor: el?.color + '22' }}
              >
                <span className="text-white font-bold text-lg w-8 text-center">{symbol}</span>
                <span className="text-gray-400 text-xs hidden sm:block">{el?.name}</span>

                {/* Quantity stepper */}
                <div className="flex items-center gap-1 ml-1">
                  <button
                    onClick={() => quantity > 1 && onQuantityChange(symbol, quantity - 1)}
                    className="w-6 h-6 rounded-full bg-gray-700 hover:bg-gray-600 text-white text-sm font-bold flex items-center justify-center transition-colors"
                  >−</button>
                  <input
                    type="number"
                    min={1}
                    max={99}
                    value={quantity}
                    onChange={e => {
                      const v = Math.min(99, Math.max(1, parseInt(e.target.value) || 1))
                      onQuantityChange(symbol, v)
                    }}
                    className="text-white text-sm font-mono w-8 text-center bg-transparent border-b border-gray-600 focus:outline-none focus:border-violet-400"
                  />
                  <button
                    onClick={() => quantity < 99 && onQuantityChange(symbol, quantity + 1)}
                    className="w-6 h-6 rounded-full bg-gray-700 hover:bg-gray-600 text-white text-sm font-bold flex items-center justify-center transition-colors"
                  >+</button>
                </div>

                <button
                  onClick={() => onRemove(symbol)}
                  className="text-gray-500 hover:text-red-400 ml-1 text-xs transition-colors"
                >✕</button>
              </div>
            )
          })}
        </div>
      )}

      {/* Mix It button */}
      <button
        onClick={onMix}
        disabled={selected.length < 2 || loading}
        className={`
          w-full py-4 rounded-2xl font-black text-lg tracking-wider transition-all duration-200
          ${selected.length >= 2 && !loading
            ? 'bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white shadow-lg shadow-violet-900/50 hover:scale-[1.02] active:scale-[0.98]'
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
            반응 중...
          </span>
        ) : 'MIX IT ⚗️'}
      </button>
    </div>
  )
}
