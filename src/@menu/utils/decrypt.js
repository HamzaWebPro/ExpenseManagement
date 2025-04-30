import CryptoJS from 'crypto-js'

const ENCRYPTION_KEY = process.env.NEXT_PUBLIC_VITE_ENCRYPTION_KEY

function decryptDataObject(encryptedString) {
  if (!encryptedString) return null

  try {
    const [ivBase64, encryptedBase64] = encryptedString.split(':')
    const key = CryptoJS.SHA256(ENCRYPTION_KEY)
    const iv = CryptoJS.enc.Base64.parse(ivBase64)

    const decrypted = CryptoJS.AES.decrypt(encryptedBase64, key, {
      iv: iv,
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7
    })

    return decrypted.toString(CryptoJS.enc.Utf8)
  } catch (error) {
    console.error('Decryption failed:', error)
    return null
  }
}

export default decryptDataObject
