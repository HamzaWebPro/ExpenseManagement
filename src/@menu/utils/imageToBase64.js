function imageToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      const base64String = reader.result.replace(/^data:image\/[a-z]+;base64,/, '')
      resolve(base64String)
    }
    reader.onerror = error => {
      reject(error)
    }
    reader.readAsDataURL(file)
  })
}

export default imageToBase64
