export interface Ingredient {
  ko: string    // 한국어
  en: string    // TheMealDB 영어 키
}

// 인기 재료 (카테고리별)
export const POPULAR_INGREDIENTS: { category: string; emoji: string; items: Ingredient[] }[] = [
  {
    category: '육류',
    emoji: '🥩',
    items: [
      { ko: '닭고기', en: 'Chicken' },
      { ko: '소고기', en: 'Beef' },
      { ko: '돼지고기', en: 'Pork' },
      { ko: '양고기', en: 'Lamb' },
      { ko: '베이컨', en: 'Bacon' },
      { ko: '소시지', en: 'Sausages' },
    ],
  },
  {
    category: '해산물',
    emoji: '🐟',
    items: [
      { ko: '연어', en: 'Salmon' },
      { ko: '새우', en: 'Prawns' },
      { ko: '참치', en: 'Tuna' },
      { ko: '대구', en: 'Cod' },
      { ko: '게살', en: 'Crab' },
      { ko: '홍합', en: 'Mussels' },
    ],
  },
  {
    category: '채소',
    emoji: '🥦',
    items: [
      { ko: '양파', en: 'Onion' },
      { ko: '마늘', en: 'Garlic' },
      { ko: '토마토', en: 'Tomatoes' },
      { ko: '감자', en: 'Potatoes' },
      { ko: '당근', en: 'Carrots' },
      { ko: '시금치', en: 'Spinach' },
      { ko: '버섯', en: 'Mushrooms' },
      { ko: '파프리카', en: 'Red Pepper' },
      { ko: '브로콜리', en: 'Broccoli' },
      { ko: '호박', en: 'Courgettes' },
    ],
  },
  {
    category: '유제품·달걀',
    emoji: '🧀',
    items: [
      { ko: '달걀', en: 'Eggs' },
      { ko: '버터', en: 'Butter' },
      { ko: '우유', en: 'Milk' },
      { ko: '생크림', en: 'Double Cream' },
      { ko: '파마산', en: 'Parmesan' },
      { ko: '체다 치즈', en: 'Cheddar Cheese' },
      { ko: '모짜렐라', en: 'Mozzarella' },
    ],
  },
  {
    category: '곡물·면',
    emoji: '🍝',
    items: [
      { ko: '파스타', en: 'Pasta' },
      { ko: '쌀', en: 'Rice' },
      { ko: '밀가루', en: 'Plain Flour' },
      { ko: '빵가루', en: 'Breadcrumbs' },
      { ko: '라자냐 면', en: 'Lasagne Sheets' },
    ],
  },
  {
    category: '소스·양념',
    emoji: '🫙',
    items: [
      { ko: '토마토 소스', en: 'Passata' },
      { ko: '올리브 오일', en: 'Olive Oil' },
      { ko: '간장', en: 'Soy Sauce' },
      { ko: '레몬즙', en: 'Lemon Juice' },
      { ko: '꿀', en: 'Honey' },
      { ko: '머스타드', en: 'Dijon Mustard' },
      { ko: '케첩', en: 'Tomato Ketchup' },
      { ko: '워스터 소스', en: 'Worcestershire Sauce' },
    ],
  },
  {
    category: '향신료·허브',
    emoji: '🌿',
    items: [
      { ko: '소금', en: 'Salt' },
      { ko: '후추', en: 'Pepper' },
      { ko: '파슬리', en: 'Parsley' },
      { ko: '바질', en: 'Basil' },
      { ko: '로즈마리', en: 'Rosemary' },
      { ko: '타임', en: 'Thyme' },
      { ko: '커민', en: 'Cumin' },
      { ko: '파프리카 가루', en: 'Paprika' },
      { ko: '칠리 플레이크', en: 'Chilli Flakes' },
      { ko: '오레가노', en: 'Dried Oregano' },
    ],
  },
  {
    category: '베이킹',
    emoji: '🧁',
    items: [
      { ko: '설탕', en: 'Sugar' },
      { ko: '베이킹파우더', en: 'Baking Powder' },
      { ko: '바닐라 에센스', en: 'Vanilla Extract' },
      { ko: '코코아 파우더', en: 'Cocoa Powder' },
      { ko: '다크 초콜릿', en: 'Dark Chocolate' },
    ],
  },
]

// 모든 재료 flat list
export const ALL_INGREDIENTS: Ingredient[] = POPULAR_INGREDIENTS.flatMap(c => c.items)

// 검색어로 재료 찾기 (한국어 or 영어)
export function searchIngredients(query: string): Ingredient[] {
  const q = query.toLowerCase().trim()
  if (!q) return []
  return ALL_INGREDIENTS.filter(
    i => i.ko.includes(q) || i.en.toLowerCase().includes(q)
  ).slice(0, 10)
}
