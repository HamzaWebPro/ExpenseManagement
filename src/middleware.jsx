import Cookies from 'js-cookie'
import { NextResponse } from 'next/server'
import decryptDataObject from './@menu/utils/decrypt'

const PUBLIC_ROUTES = ['/login', '/registration']

export function middleware(request) {
  const pathname = request.nextUrl?.pathname?.replace(/\/$/, '') || '/'
  const sessionToken = request.cookies.get('sessionToken')?.value

  console.log('pathname:', pathname)
  console.log('sessionToken:', sessionToken)

  if (sessionToken && PUBLIC_ROUTES.includes(pathname)) {
    const userRole = JSON.parse(decryptDataObject(sessionToken))?.role
    const userRolePath =
      userRole === 'superAdmin'
        ? '/super-admin-dashboard'
        : userRole === 'admin'
          ? '/admin-dashboard'
          : userRole === 'manager'
            ? '/manager-dashboard'
            : '/user-dashboard'
    console.log('userRole:', userRole)
    return NextResponse.redirect(new URL(userRolePath, request.url))
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
