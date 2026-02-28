import { Button } from "@/components/ui/button"

function App() {
  return (
    // min-h-screen: Tüm ekran yüksekliğini kaplar
    // flex items-center justify-center: İçeriği yatay ve dikeyde tam merkeze alır
    // bg-background text-foreground: shadcn/ui'nin otomatik aydınlık/karanlık mod renklerini uygular
    <div className="flex min-h-screen w-full items-center justify-center bg-background text-foreground">
      
      <Button size="lg" className="text-lg px-8 py-6">
        Spotify Yönetim Paneli
      </Button>

    </div>
  )
}

export default App