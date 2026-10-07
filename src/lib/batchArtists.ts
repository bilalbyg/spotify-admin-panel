import { api, type Artist } from "./api"

export interface BatchArtistResult {
  success: boolean
  name: string
  artist?: Artist
  error?: unknown
}

const DEFAULT_ARTISTS = [
  { name: "Luna Echo", bio: "Dream pop soundscapes from the north." },
  { name: "The Midnight Drifters", bio: "Indie rock with a nocturnal twist." },
  { name: "Nova Cascade", bio: "Electronic chillout and ambient beats." },
  { name: "Velvet Horizon", bio: "Soulful vocals over smooth instrumentals." },
  { name: "Solstice Bloom", bio: "Folk-inspired acoustic journeys." },
  { name: "Ember Falls", bio: "High-energy alternative rock anthems." },
  { name: "Aurora Veil", bio: "Cinematic synth and orchestral pop." },
  { name: "Crimson Tide", bio: "Heavy blues and garage rock fusion." },
  { name: "Echo Chambers", bio: "Psychedelic rock with layered guitars." },
  {
    name: "Neon Wildflower",
    bio: "Retro pop with modern electronic flourishes.",
  },
]

function generatePlaceholderImage(name: string): Promise<File> {
  const canvas = document.createElement("canvas")
  canvas.width = 400
  canvas.height = 400
  const ctx = canvas.getContext("2d")
  if (!ctx) {
    throw new Error("Canvas context could not be created")
  }

  const hue = Math.floor(Math.random() * 360)
  ctx.fillStyle = `hsl(${hue}, 70%, 60%)`
  ctx.fillRect(0, 0, 400, 400)

  ctx.fillStyle = "#ffffff"
  ctx.font = "bold 160px sans-serif"
  ctx.textAlign = "center"
  ctx.textBaseline = "middle"
  const initials = name
    .split(" ")
    .map((word) => word.charAt(0))
    .slice(0, 2)
    .join("")
    .toUpperCase()
  ctx.fillText(initials, 200, 200)

  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (!blob) {
        reject(new Error("Image blob generation failed"))
        return
      }
      const safeName = name.replace(/\s+/g, "-").toLowerCase()
      resolve(new File([blob], `${safeName}.png`, { type: "image/png" }))
    }, "image/png")
  })
}

export async function createManyArtists(
  artists: { name: string; bio: string; image: File | null }[]
): Promise<{ created: Artist[]; failed: { name: string; error: unknown }[] }> {
  if (artists.length === 0) {
    return { created: [], failed: [] }
  }

  const formData = new FormData()
  const metadata = artists.map((artist, index) => ({
    name: artist.name,
    bio: artist.bio,
    imageIndex: artist.image ? index : null,
  }))
  formData.append("artists", JSON.stringify(metadata))

  artists.forEach((artist) => {
    if (artist.image) {
      formData.append("images", artist.image)
    }
  })

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

export async function seedRandomArtists(
  onProgress?: (current: number, total: number, name: string) => void
): Promise<BatchArtistResult[]> {
  const images: File[] = []
  const metadata = DEFAULT_ARTISTS.map(({ name, bio }, index) => {
    // Görsel oluşturma Promise olarak ileride çözülecek
    return { name, bio, imageIndex: index, placeholderIndex: index }
  })

  for (let i = 0; i < DEFAULT_ARTISTS.length; i++) {
    const { name } = DEFAULT_ARTISTS[i]
    try {
      const image = await generatePlaceholderImage(name)
      images.push(image)
      onProgress?.(i + 1, DEFAULT_ARTISTS.length, name)
    } catch {
      images.push(new File([], `${name}.png`, { type: "image/png" }))
      onProgress?.(i + 1, DEFAULT_ARTISTS.length, name)
    }
  }

  try {
    const formData = new FormData()
    formData.append(
      "artists",
      JSON.stringify(
        metadata.map(({ name, bio, imageIndex }) => ({
          name,
          bio,
          imageIndex,
        }))
      )
    )
    images.forEach((image) => formData.append("images", image))

    const response = await api.post<Artist[]>("/artists/bulk", formData, {
      headers: { "Content-Type": undefined },
    })

    return DEFAULT_ARTISTS.map(({ name }, index) => {
      const artist = response.data[index]
      return {
        success: artist !== undefined,
        name,
        artist,
      }
    })
  } catch (error) {
    return DEFAULT_ARTISTS.map(({ name }) => ({ success: false, name, error }))
  }
}
