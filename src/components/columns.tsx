import type { ColumnDef } from "@tanstack/react-table"

// Şarkı tipimizi burada tanımlıyoruz
export type Song = {
  id: string
  title: string
  artist: string
  albumImageUrl: string
  audioUrl: string
}

// Sütunlarımızın ayarları
export const columns: ColumnDef<Song>[] = [
  {
    accessorKey: "title",
    header: "Şarkı Adı",
  },
  {
    accessorKey: "artist",
    header: "Sanatçı",
  },
  {
    accessorKey: "audioUrl",
    header: "Ses Dosyası",
    cell: ({ row }) => {
      // Linki tıklanabilir hale getiriyoruz
      return (
        <a 
          href={row.getValue("audioUrl")} 
          target="_blank" 
          rel="noreferrer"
          className="text-blue-500 hover:underline"
        >
          Dinle
        </a>
      )
    }
  },
]