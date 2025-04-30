import { NextResponse } from 'next/server'
import decryptDataObject from './@menu/utils/decrypt'

const PUBLIC_ROUTES = ['/login', '/registration']

export function middleware(request) {
  const pathname = request.nextUrl?.pathname
  const sessionToken = request.cookies.get('sessionToken')?.value

  console.log('pathname:', pathname)

  if (PUBLIC_ROUTES.includes(pathname)) {
    return NextResponse.next()
  }

  if (!sessionToken && !pathname.startsWith('/_next') && !pathname.includes('.')) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  if (sessionToken) {
    return NextResponse.next()
  }

  return NextResponse.next()
}

export const config = {
  matcher: '/:path*'
}
