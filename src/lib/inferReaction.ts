import { ReactionType, AnimationType } from '@/types'

const ALKALI      = new Set(['Li','Na','K','Rb','Cs','Fr'])
const ALK_EARTH   = new Set(['Be','Mg','Ca','Sr','Ba','Ra'])
const HALOGENS    = new Set(['F','Cl','Br','I','At'])
const NOBLE       = new Set(['He','Ne','Ar','Kr','Xe','Rn','Og'])
const TRANSITION  = new Set(['Fe','Cu','Ni','Co','Mn','Cr','Zn','Ag','Hg','Pb','Cd','Ti','V','W','Mo','Au','Pt','Pd','Rh','Ir','Os','Re','Tc','Ru','Nb','Zr','Y','Sc','Bi','Sn','In','Ga','Tl','Ge','As'])
const RADIOACTIVE = new Set(['U','Pu','Ra','Th','Np','Am','Cm','Pa','Ac'])

type EMap = Record<string, number>

function toMap(elements: string[], ratios: number[]): EMap {
  const m: EMap = {}
  elements.forEach((el, i) => { m[el] = ratios[i] })
  return m
}

export function inferReactionType(elements: string[], ratios: number[]): ReactionType {
  const m    = toMap(elements, ratios)
  const elSet = new Set(elements)
  const total = elements.length

  // 비활성 기체 단독
  if (elements.every(e => NOBLE.has(e))) return 'none'

  // 폭발성 조합
  //  - 질소 + 산소 비율이 크거나 (NO₂ 계열 폭발물)
  //  - NH₄NO₃, 아지드류
  if (m['N'] && m['O'] && !m['C']) {
    const nitrateRatio = (m['O'] ?? 0) / (m['N'] ?? 1)
    if (nitrateRatio >= 3) return 'explosion'
  }
  if (m['N'] && m['H'] && !m['C'] && !m['O'] && (m['N'] ?? 0) >= 1 && elSet.size <= 3) return 'gas'

  // 방사성 원소
  if (elements.some(e => RADIOACTIVE.has(e))) {
    if (m['O']) return 'precipitation' // 산화물 → 침전
    return 'none'
  }

  // 순수 탄화수소 (C + H 만)
  if (elSet.size === 2 && m['C'] && m['H']) return 'combustion'

  // 유기물 (C 포함)
  if (m['C'] && m['H']) return 'dissolution'
  if (m['C'] && m['O'] && elSet.size <= 2) return 'gas' // CO, CO₂

  // 금속 + O 만 → 연소
  if (m['O'] && elSet.size === 2) {
    const metal = elements.find(e => e !== 'O')!
    if (ALKALI.has(metal) || ALK_EARTH.has(metal) || ['Al','Mg','Fe','Cu','Zn'].includes(metal))
      return 'combustion'
  }

  // 불용성 침전 규칙
  //  - Ag + 할로겐: 흰색/노란 침전
  //  - Pb, Ba, Sr, Hg + 황산/탄산/인산/황화물
  const heavyPrecip = new Set(['Ag','Pb','Hg','Ba','Sr','Bi','Tl'])
  if (elements.some(e => heavyPrecip.has(e)) && elements.some(e => HALOGENS.has(e) || ['S','C'].includes(e)))
    return 'precipitation'
  if (elements.some(e => ['Ba','Pb','Sr'].includes(e)) && m['S'] && m['O']) return 'precipitation'

  // 전이금속 (색깔 있는 용액)
  if (elements.some(e => TRANSITION.has(e)) && !m['C']) {
    const hasHalide = elements.some(e => HALOGENS.has(e))
    if (hasHalide && elements.some(e => ['Pb','Hg','Bi','Ag'].includes(e))) return 'precipitation'
    return 'dissolution'
  }

  // 알칼리/알칼리토 + 음이온 → 용해
  if (elements.some(e => ALKALI.has(e) || ALK_EARTH.has(e))) return 'dissolution'

  // 기체 단원소 조합
  if (total <= 2 && elements.every(e => ['H','N','O','S','Cl','Br','F'].includes(e))) return 'gas'

  return 'dissolution'
}

export function inferAnimation(reactionType: ReactionType): AnimationType {
  switch (reactionType) {
    case 'precipitation': return 'sink'
    case 'gas':           return 'bubble'
    case 'explosion':     return 'explode'
    case 'combustion':    return 'burn'
    case 'color_change':  return 'colorchange'
    case 'dissolution':   return 'dissolve'
    default:              return 'none'
  }
}

export function inferColor(elements: string[], ratios: number[]): string {
  const m = toMap(elements, ratios)

  // 전이금속 특유 색깔
  if (m['Cu']  && !m['C'])               return '#1E90FF'  // 구리(II) 파란색
  if (m['Cu']  &&  m['C'])               return '#228B22'  // 아세트산구리 초록
  if (m['Fe']  &&  m['O'] && (m['O']??0) >= 3) return '#8B4513' // Fe₂O₃ 적갈색
  if (m['Fe'])                            return '#6B8E23'  // Fe(II) 올리브
  if (m['Co'])                            return '#FF69B4'  // 코발트 핑크
  if (m['Ni'])                            return '#90EE90'  // 니켈 연두
  if (m['Cr']  &&  m['O'] && (m['O']??0) >= 4) return '#FFD700' // 크롬산 황금
  if (m['Cr'])                            return '#4B0082'  // 크롬(III) 보라
  if (m['Mn']  &&  m['O'] && (m['O']??0) >= 4) return '#8B008B' // 과망간산 짙은 보라
  if (m['Mn'])                            return '#FFB6C1'  // Mn(II) 연분홍
  if (m['V'])                             return '#FF8C00'  // 바나듐 주황
  if (m['Pb']  &&  m['I'])               return '#FFD700'  // PbI₂ 선명 노랑
  if (m['Hg']  &&  m['S'])               return '#FF0000'  // HgS 빨강
  if (m['Hg']  &&  m['I'])               return '#FF2222'  // HgI₂ 빨강
  if (m['Cd']  &&  m['S'])               return '#FFD700'  // CdS 노랑
  if (m['Au'])                            return '#FFD700'  // 금 황금
  if (m['Ag'])                            return '#E8E8E8'  // 은 흰빛
  if (m['U'])                             return '#D4C869'  // 옐로케이크 황녹색
  if (m['Pu'] || m['Np'])                return '#808040'  // 플루토늄 황갈
  if (m['S']   && !m['O'] && !m['C'])    return '#1A1A1A'  // 황화물 검정
  if (m['C']   &&  m['H'] && !m['O'])    return '#D0D0D0'  // 탄화수소 회색
  if (m['C']   &&  m['H'] &&  m['O'])    return '#ADD8E6'  // 유기물 연파란
  if (m['N']   &&  m['O'])               return '#D4D4AA'  // 질소산화물 연황
  if (m['I'])                             return '#8B008B'  // 요오드 자주
  if (m['Br'])                            return '#8B2500'  // 브로민 적갈

  return '#F5F5F5'  // 기본 흰색
}

// Hill notation 공식 문자열 생성
export function buildHillFormula(selected: { symbol: string; quantity: number }[]): string {
  const hasCarbon = selected.some(s => s.symbol === 'C')
  const sorted = [...selected].sort((a, b) => {
    if (hasCarbon) {
      if (a.symbol === 'C') return -1
      if (b.symbol === 'C') return 1
      if (a.symbol === 'H') return -1
      if (b.symbol === 'H') return 1
    }
    return a.symbol.localeCompare(b.symbol)
  })
  return sorted.map(s => s.quantity === 1 ? s.symbol : `${s.symbol}${s.quantity}`).join('')
}
