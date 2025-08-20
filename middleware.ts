// Middleware temporariamente desabilitado para debug
// import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
// import { NextResponse } from 'next/server'
// import type { NextRequest } from 'next/server'

// export async function middleware(req: NextRequest) {
//   return NextResponse.next()
// }

// export const config = {
//   matcher: [],
// }

// Middleware desabilitado - usando proteção no cliente
export function middleware() {
  // Não fazer nada - deixar o cliente gerenciar autenticação
}

export const config = {
  matcher: [],
}