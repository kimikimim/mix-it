'use client'

import { ELEMENTS, CATEGORY_COLORS } from '@/lib/elements'
import { Element, SelectedElement } from '@/types'

interface Props {
  selected: SelectedElement[]
  onSelect: (element: Element) => void
}

const GROUP_COLS: Record<number, number> = {
  1: 1, 2: 2, 3: 4, 4: 5, 5: 6, 6: 7, 7: 8, 8: 9, 9: 10, 10: 11,
  11: 12, 12: 13, 13: 14, 14: 15, 15: 16, 16: 17, 17: 18, 18: 19,
}

export default function PeriodicTable({ selected, onSelect }: Props) {
  const mainElements = ELEMENTS.filter(e => e.group !== 0)
  const lanthanides = ELEMENTS.filter(e => e.category === 'lanthanide').sort((a, b) => a.number - b.number)
  const actinides = ELEMENTS.filter(e => e.category === 'actinide').sort((a, b) => a.number - b.number)

  const isSelected = (symbol: string) => selected.some(s => s.symbol === symbol)
  const canSelect = (symbol: string) => selected.length < 6 || isSelected(symbol)

  const getCellStyle = (element: Element) => {
    const sel = isSelected(element.symbol)
    const bg = CATEGORY_COLORS[element.category] || '#ffffff10'
    return {
      backgroundColor: sel ? element.color + '88' : bg,
      borderColor: sel ? element.color : 'transparent',
      gridColumn: GROUP_COLS[element.group] || 1,
      gridRow: element.period,
    }
  }

  return (
    <div className="w-full overflow-x-auto">
      {/* Main table */}
      <div
        className="grid gap-0.5 min-w-[900px]"
        style={{ gridTemplateColumns: 'repeat(19, 1fr)' }}
      >
        {mainElements.map(el => (
          <button
            key={el.symbol}
            onClick={() => canSelect(el.symbol) && onSelect(el)}
            disabled={!canSelect(el.symbol)}
            className={`
              relative flex flex-col items-center justify-center rounded
              border-2 text-center transition-all duration-150 select-none
              ${isSelected(el.symbol) ? 'ring-2 ring-white scale-105 z-10' : ''}
              ${canSelect(el.symbol) ? 'cursor-pointer hover:brightness-125' : 'opacity-30 cursor-not-allowed'}
              p-0.5
            `}
            style={getCellStyle(el)}
            title={el.name}
          >
            <span className="text-[7px] text-gray-400 leading-none">{el.number}</span>
            <span className="text-xs font-bold text-white leading-tight">{el.symbol}</span>
            <span className="text-[6px] text-gray-300 leading-none truncate w-full text-center">{el.name}</span>
          </button>
        ))}

        {/* Lanthanide/Actinide gap labels */}
        <div style={{ gridColumn: '4', gridRow: '6' }}
          className="flex items-center justify-center text-[7px] text-gray-500">57-71</div>
        <div style={{ gridColumn: '4', gridRow: '7' }}
          className="flex items-center justify-center text-[7px] text-gray-500">89-103</div>
      </div>

      {/* Lanthanides & Actinides */}
      <div className="mt-3 min-w-[900px]">
        {[lanthanides, actinides].map((series, si) => (
          <div key={si} className="flex gap-0.5 mb-0.5 ml-[calc(3/19*100%+1.5px)]">
            {series.map(el => (
              <button
                key={el.symbol}
                onClick={() => canSelect(el.symbol) && onSelect(el)}
                disabled={!canSelect(el.symbol)}
                className={`
                  flex-1 flex flex-col items-center justify-center rounded border-2
                  text-center transition-all duration-150 select-none p-0.5
                  ${isSelected(el.symbol) ? 'ring-2 ring-white scale-105 z-10' : ''}
                  ${canSelect(el.symbol) ? 'cursor-pointer hover:brightness-125' : 'opacity-30 cursor-not-allowed'}
                `}
                style={{
                  backgroundColor: isSelected(el.symbol) ? el.color + '88' : CATEGORY_COLORS[el.category],
                  borderColor: isSelected(el.symbol) ? el.color : 'transparent',
                }}
                title={el.name}
              >
                <span className="text-[7px] text-gray-400 leading-none">{el.number}</span>
                <span className="text-xs font-bold text-white leading-tight">{el.symbol}</span>
                <span className="text-[6px] text-gray-300 leading-none truncate w-full text-center">{el.name}</span>
              </button>
            ))}
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="mt-3 flex flex-wrap gap-2 text-[10px] text-gray-400 min-w-[900px]">
        {Object.entries({
          'alkali-metal': 'Alkali Metal', 'alkaline-earth': 'Alkaline Earth',
          'transition': 'Transition', 'post-transition': 'Post-transition',
          'metalloid': 'Metalloid', 'nonmetal': 'Nonmetal',
          'halogen': 'Halogen', 'noble-gas': 'Noble Gas',
          'lanthanide': 'Lanthanide', 'actinide': 'Actinide',
        }).map(([key, label]) => (
          <div key={key} className="flex items-center gap-1">
            <div className="w-3 h-3 rounded" style={{ backgroundColor: CATEGORY_COLORS[key] }} />
            <span>{label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
