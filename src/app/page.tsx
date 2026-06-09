import { AuthProvider } from "@/components/AuthProvider";
import GlobalBackground from "@/components/GlobalBackground";
import LoginModal from "@/components/LoginModal";
import Hero from "@/components/Hero";
import Cake from "@/components/Cake";
import Gallery from "@/components/Gallery";
import PetsSection from "@/components/PetsSection";
import TarotReading from "@/components/TarotReading";
import Letter from "@/components/Letter";
import MessageWall from "@/components/MessageWall";
import MusicButton from "@/components/MusicButton";
import Footer from "@/components/Footer";

// =====================================================================
// Página principal: un único fondo continuo (GlobalBackground) detrás de
// todas las secciones. Cada sección es transparente; solo Tarot pinta su
// propio fondo oscuro místico por encima.
// =====================================================================

export default function Home() {
  return (
    <AuthProvider>
      {/* Fondo único + partículas + grano para todo el sitio */}
      <GlobalBackground />

      <main className="relative flex w-full flex-col overflow-hidden">
        <Hero />
        <Cake />
        <Gallery />
        <PetsSection />
        <TarotReading />
        <Letter />
        <MessageWall />
        <Footer />
      </main>

      {/* Botón flotante de música + modal de login (sobre todo el sitio) */}
      <MusicButton />
      <LoginModal />
    </AuthProvider>
  );
}
