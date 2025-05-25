import decryptDataObject from './decrypt'

class TokenManager {
  static getTokenKey() {
    return 'sessionToken'
  }

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

  static async getLoginToken() {
    try {
      const tokens = await this.getClientToken()
      return tokens
    } catch (error) {
      console.error('Failed to get login token:', error)
      return null
    }
  }

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

  static async getServerTokenFromReq(req) {
    const rawToken = req?.cookies?.[this.getTokenKey()]
    return rawToken ? await this.parseSessionToken(rawToken) : null
  }

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
