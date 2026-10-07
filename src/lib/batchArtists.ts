import { api, type Artist } from "./api"

export async function createManyArtists(
  artists: { name: string; bio: string; image: File | null }[]
): Promise<{ created: Artist[]; failed: { name: string; error: unknown }[] }> {
  if (artists.length === 0) {
    return { created: [], failed: [] }
  }

  const images: File[] = []
  const metadata = artists.map((artist) => {
    if (artist.image) {
      const index = images.length
      images.push(artist.image)
      return { name: artist.name, bio: artist.bio, imageIndex: index }
    }
    return { name: artist.name, bio: artist.bio, imageIndex: null }
  })

  const formData = new FormData()
  formData.append(
    "artists",
    new Blob([JSON.stringify(metadata)], { type: "application/json" })
  )
  images.forEach((image) => formData.append("images", image))

  try {
    const response = await api.post<Artist[]>("/artists/bulk", formData, {
      headers: { "Content-Type": undefined },
    })
    return {
      created: response.data,
      failed: [],
    }
  } catch (error) {
    return {
      created: [],
      failed: artists.map((artist) => ({ name: artist.name, error })),
    }
  }
}
