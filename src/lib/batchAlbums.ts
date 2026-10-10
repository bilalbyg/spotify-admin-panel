import { api, type Album } from "./api"

export interface BulkAlbumRow {
  title: string
  releaseYear: number
  image: File | null
}

export async function createManyAlbums(
  artistId: string,
  albums: BulkAlbumRow[]
): Promise<{ created: Album[]; failed: { title: string; error: unknown }[] }> {
  if (albums.length === 0) {
    return { created: [], failed: [] }
  }

  const images: File[] = []
  const metadata = albums.map((album) => {
    if (album.image) {
      const index = images.length
      images.push(album.image)
      return {
        title: album.title,
        releaseYear: album.releaseYear,
        imageIndex: index,
      }
    }
    return {
      title: album.title,
      releaseYear: album.releaseYear,
      imageIndex: null,
    }
  })

  const formData = new FormData()
  formData.append("artistId", artistId)
  formData.append(
    "albums",
    new Blob([JSON.stringify(metadata)], { type: "application/json" })
  )
  images.forEach((image) => formData.append("images", image))

  const created: Album[] = []
  const failed: { title: string; error: unknown }[] = []

  try {
    const response = await api.post<Album[]>("/albums/bulk", formData, {
      headers: { "Content-Type": undefined },
    })
    created.push(...response.data)
  } catch (error) {
    for (const album of albums) {
      failed.push({ title: album.title, error })
    }
  }

  return { created, failed }
}
