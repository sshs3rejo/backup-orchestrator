import { NextResponse } from "next/server"
import { testRemote, deleteRemote } from "@/lib/rclone"

// POST = testar conexão do remote
export async function POST(
  _request: Request,
  { params }: { params: Promise<{ name: string }> }
) {
  const { name } = await params

  try {
    const result = await testRemote(name)
    return NextResponse.json(result)
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : "Test falhou",
      },
      { status: 500 }
    )
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ name: string }> }
) {
  const { name } = await params

  try {
    await deleteRemote(name)
    return NextResponse.json({ success: true, name })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Falha ao deletar remote" },
      { status: 500 }
    )
  }
}