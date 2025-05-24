// import { decryptDataObject } from '@/utils/encryption'

import decryptDataObject from './decrypt'

class TokenManager {
  static getTokenKey() {
    return 'sessionToken'
  }

  // 🔐 Decrypt, parse, and extract tokens
  static async parseSessionToken(rawToken) {
    try {
      const decrypted = decryptDataObject(rawToken)
      const parsed = JSON.parse(decrypted)
      return parsed?.tokens ?? null
    } catch (error) {
      console.error('Failed to parse session token:', error)
      return null
    }
  }

  // ✅ Client-side: get login token
  static async getLoginToken() {
    try {
      const tokens = await this.getClientToken()
      return tokens
    } catch (error) {
      console.error('Failed to get login token:', error)
      return null
    }
  }

  // ✅ Client-side: get token from cookies and parse
  static async getClientToken() {
    if (typeof document === 'undefined') return null

    const name = this.getTokenKey() + '='
    const cookies = document.cookie.split(';')

    for (const cookie of cookies) {
      const trimmed = cookie.trim()
      if (trimmed.startsWith(name)) {
        const rawToken = trimmed.substring(name.length)
        return await this.parseSessionToken(rawToken)
      }
    }

    return null
  }

  // ✅ Server-side (pages/ or API routes)
  static async getServerTokenFromReq(req) {
    const rawToken = req?.cookies?.[this.getTokenKey()]
    return rawToken ? await this.parseSessionToken(rawToken) : null
  }

  // ✅ Server-side (app/ directory)
  static async getServerTokenAppDir() {
    try {
      const { cookies } = require('next/headers')
      const cookieStore = cookies()
      const rawToken = cookieStore.get(this.getTokenKey())?.value
      return rawToken ? await this.parseSessionToken(rawToken) : null
    } catch {
      return null
    }
  }
}

export default TokenManager
