import { NextRequest, NextResponse } from 'next/server'

const BASE = 'https://pubchem.ncbi.nlm.nih.gov/rest/pug'

// PubChem은 복잡한 formula에 비동기 ListKey 응답을 반환함
// → ListKey를 받으면 폴링해서 결과를 가져와야 함
async function fetchWithListKey(url: string): Promise<unknown> {
  const res = await fetch(url, { cache: 'no-store' })
  if (!res.ok) return null

  const data = await res.json()

  // 비동기 응답이면 ListKey 폴링
  if (data?.Waiting?.ListKey) {
    const listKey = data.Waiting.ListKey
    // 최대 6번 (총 ~6초) 폴링
    for (let i = 0; i < 6; i++) {
      await new Promise(r => setTimeout(r, 1000))
      const pollUrl = `${BASE}/compound/listkey/${listKey}/property/MolecularFormula,IUPACName,MolecularWeight/JSON?MaxRecords=3`
      const pollRes = await fetch(pollUrl, { cache: 'no-store' })
      if (!pollRes.ok) continue
      const pollData = await pollRes.json()
      if (pollData?.PropertyTable) return pollData
      if (pollData?.Waiting) continue   // 아직 처리 중
      break
    }
    return null
  }

  return data
}

export async function GET(request: NextRequest) {
  const formula = request.nextUrl.searchParams.get('formula')
  if (!formula) return NextResponse.json(null)

  try {
    // 1) formula로 화합물 기본 정보 조회 (ListKey 폴링 포함)
    const url = `${BASE}/compound/formula/${encodeURIComponent(formula)}/property/MolecularFormula,IUPACName,MolecularWeight/JSON?MaxRecords=3`
    const propData = await fetchWithListKey(url) as { PropertyTable?: { Properties?: { CID: number; MolecularFormula: string; IUPACName: string; MolecularWeight: number }[] } } | null

    const props = propData?.PropertyTable?.Properties
    if (!props?.length) return NextResponse.json(null)

    // 분자량이 가장 작은 (가장 단순한) 화합물 선택
    const compound = [...props].sort((a, b) => a.MolecularWeight - b.MolecularWeight)[0]

    // 2) CID로 동의어(일반명) 조회
    const cid = compound.CID
    let commonName: string = compound.IUPACName

    try {
      const synRes = await fetch(
        `${BASE}/compound/cid/${cid}/synonyms/JSON`,
        { next: { revalidate: 86400 } }
      )
      if (synRes.ok) {
        const synData = await synRes.json()
        const syns: string[] = synData?.InformationList?.Information?.[0]?.Synonym ?? []
        const clean = syns.filter(
          s => !/^[0-9\-]+$/.test(s) &&
               !s.startsWith('InChI') &&
               !s.includes('=') &&
               !s.includes('SMILES') &&
               s.length < 80
        )
        if (clean.length) commonName = clean[0]
      }
    } catch {
      // 동의어 실패해도 계속
    }

    return NextResponse.json({
      cid,
      formula: compound.MolecularFormula,
      iupac_name: compound.IUPACName,
      common_name: commonName,
    })
  } catch {
    return NextResponse.json(null)
  }
}
