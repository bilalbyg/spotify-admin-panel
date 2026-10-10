import { api, type Song } from "./api"

export interface BulkSongRow {
  title: string
  duration: number
  audioFile: File
}

export async function createManySongs(
  albumId: string,
  songs: BulkSongRow[]
): Promise<{ created: Song[]; failed: { title: string; error: unknown }[] }> {
  if (songs.length === 0) {
    return { created: [], failed: [] }
  }

  const audioFiles: File[] = []
  const metadata = songs.map((song) => {
    const audioIndex = audioFiles.length
    audioFiles.push(song.audioFile)
    return {
      title: song.title,
      duration: song.duration,
      audioIndex,
    }
  })

  const formData = new FormData()
  formData.append("albumId", albumId)
  formData.append(
    "songs",
    new Blob([JSON.stringify(metadata)], { type: "application/json" })
  )
  audioFiles.forEach((audioFile) => formData.append("audioFiles", audioFile))

  try {
    const response = await api.post<Song[]>("/songs/bulk", formData, {
      headers: { "Content-Type": undefined },
    })
    return { created: response.data, failed: [] }
  } catch (error) {
    return {
      created: [],
      failed: songs.map((song) => ({ title: song.title, error })),
    }
  }
}
