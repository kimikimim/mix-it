import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const formula = request.nextUrl.searchParams.get('formula')
  if (!formula) return NextResponse.json(null)

  try {
    // 1) formula로 화합물 기본 정보 조회
    const propRes = await fetch(
      `https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/formula/${encodeURIComponent(formula)}/property/MolecularFormula,IUPACName,MolecularWeight/JSON?MaxRecords=3`,
      { next: { revalidate: 86400 } }
    )
    if (!propRes.ok) return NextResponse.json(null)

    const propData = await propRes.json()
    const props = propData?.PropertyTable?.Properties
    if (!props?.length) return NextResponse.json(null)

    // 분자량이 가장 작은 (가장 단순한) 화합물 선택
    const compound = props.sort((a: { MolecularWeight: number }, b: { MolecularWeight: number }) =>
      a.MolecularWeight - b.MolecularWeight
    )[0]

    // 2) CID로 동의어(일반명) 조회
    const cid = compound.CID
    let commonName: string = compound.IUPACName

    try {
      const synRes = await fetch(
        `https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/cid/${cid}/synonyms/JSON`,
        { next: { revalidate: 86400 } }
      )
      if (synRes.ok) {
        const synData = await synRes.json()
        const syns: string[] = synData?.InformationList?.Information?.[0]?.Synonym ?? []
        // 일반명 우선 (숫자로만 이루어진 이름, InChI, SMILES 제외)
        const clean = syns.filter(
          s => !/^[0-9\-]+$/.test(s) && !s.startsWith('InChI') && !s.includes('=') && s.length < 80
        )
        if (clean.length) commonName = clean[0]
      }
    } catch {
      // 동의어 조회 실패해도 계속 진행
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
