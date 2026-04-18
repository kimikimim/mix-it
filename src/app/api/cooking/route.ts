import { NextRequest, NextResponse } from 'next/server'

const BASE = 'https://api.spoonacular.com'
const KEY  = process.env.SPOONACULAR_API_KEY

export async function GET(request: NextRequest) {
  const raw = request.nextUrl.searchParams.get('ingredients')
  if (!raw || !KEY) return NextResponse.json(null)

  const ingredients = raw.split(',').map(s => s.trim()).filter(Boolean)
  if (!ingredients.length) return NextResponse.json(null)

  try {
    // 재료로 레시피 검색 (최대 매칭 순)
    const searchRes = await fetch(
      `${BASE}/recipes/findByIngredients?apiKey=${KEY}&ingredients=${encodeURIComponent(ingredients.join(','))}&number=5&ranking=1&ignorePantry=true`,
      { next: { revalidate: 3600 } }
    )
    if (!searchRes.ok) return NextResponse.json(null)

    const results = await searchRes.json()
    if (!results?.length) return NextResponse.json(null)

    // 가장 많이 매칭된 첫 번째 레시피 상세 조회
    const best = results[0]
    const detailRes = await fetch(
      `${BASE}/recipes/${best.id}/information?apiKey=${KEY}&includeNutrition=false`,
      { next: { revalidate: 86400 } }
    )
    if (!detailRes.ok) return NextResponse.json(null)

    const detail = await detailRes.json()

    const ingredientList: string[] = (detail.extendedIngredients ?? []).map(
      (i: { original: string }) => i.original
    )

    return NextResponse.json({
      id: String(detail.id),
      name: detail.title,
      category: detail.dishTypes?.[0] ?? detail.cuisines?.[0] ?? '',
      area: detail.cuisines?.[0] ?? '',
      thumbnail: detail.image ?? '',
      matched_count: best.usedIngredientCount,
      total_selected: ingredients.length,
      missing_count: best.missedIngredientCount,
      ingredients: ingredientList,
      ready_in_minutes: detail.readyInMinutes,
      servings: detail.servings,
    })
  } catch {
    return NextResponse.json(null)
  }
}
