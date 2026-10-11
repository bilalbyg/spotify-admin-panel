export function readAudioDurationInSeconds(file: File): Promise<number> {
  return new Promise((resolve, reject) => {
    const audio = new Audio()
    const objectUrl = URL.createObjectURL(file)

    const cleanup = () => {
      audio.onloadedmetadata = null
      audio.onerror = null
      URL.revokeObjectURL(objectUrl)
    }

    audio.preload = "metadata"
    audio.onloadedmetadata = () => {
      const duration = audio.duration
      cleanup()

      if (!Number.isFinite(duration) || duration <= 0) {
        reject(new Error("Ses dosyasının süresi okunamadı."))
        return
      }

      resolve(Math.round(duration))
    }
    audio.onerror = () => {
      cleanup()
      reject(new Error("Ses dosyası okunamadı. MP3 dosyasını kontrol edin."))
    }
    audio.src = objectUrl
  })
}

export function formatAudioDuration(durationInSeconds: number): string {
  const minutes = Math.floor(durationInSeconds / 60)
  const seconds = durationInSeconds % 60
  return `${minutes}:${seconds.toString().padStart(2, "0")}`
}
