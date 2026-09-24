import { NextRequest, NextResponse } from "next/server"
import { startOAuth, checkOAuthStatus } from "@/lib/google-oauth"

// POST /api/storage/oauth — inicia fluxo de autorização
export async function POST() {
  try {
    const result = await startOAuth()
    return NextResponse.json(result)
  } catch (err) {
    const message = err instanceof Error ? err.message : "Erro ao iniciar OAuth"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

// GET /api/storage/oauth?state=... — consulta o status do fluxo
export async function GET(req: NextRequest) {
  const state = req.nextUrl.searchParams.get("state")
  if (!state) {
    return NextResponse.json({ error: "state é obrigatório" }, { status: 400 })
  }

  const result = checkOAuthStatus(state)
  return NextResponse.json(result)
}