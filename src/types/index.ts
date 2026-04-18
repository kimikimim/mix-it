export type ReactionType = 'precipitation' | 'gas' | 'explosion' | 'dissolution' | 'color_change' | 'combustion' | 'none'
export type AnimationType = 'sink' | 'bubble' | 'explode' | 'dissolve' | 'colorchange' | 'burn' | 'none'

export interface Reaction {
  id: string
  elements: string[]
  ratios: number[]
  product_formula: string
  product_name: string
  reaction_type: ReactionType
  animation: AnimationType
  color: string
  secondary_color?: string
  is_pubchem?: boolean
}

export interface SelectedElement {
  symbol: string
  quantity: number
}

export interface Element {
  symbol: string
  name: string
  number: number
  group: number
  period: number
  category: string
  color: string
}
