import { NextResponse } from 'next/server'

const PUBLIC_ROUTES = ['/login', '/registration']

export function middleware(request) {
  const pathname = request.nextUrl?.pathname?.replace(/\/$/, '') || '/'
  const sessionToken = request.cookies.get('sessionToken')?.value

  console.log('pathname:', pathname)
  console.log('sessionToken:', sessionToken)

  if (sessionToken && PUBLIC_ROUTES.includes(pathname)) {
    return NextResponse.redirect(new URL('/home', request.url))
  }

  if (PUBLIC_ROUTES.includes(pathname)) {
    return NextResponse.next()
  }

  if (!sessionToken && !pathname.startsWith('/_next') && !pathname.includes('.')) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: '/:path*'
}
