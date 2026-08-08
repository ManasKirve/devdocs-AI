import Navbar from '../components/Navbar'
import Hero from '../components/Hero'
import RepositoryAnalyzer from '../components/RepositoryAnalyzer'
import Features from '../components/Features'
import AISection from '../components/AISection'
import Technologies from '../components/Technologies'
import Footer from '../components/Footer'

export default function HomePage() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <RepositoryAnalyzer />
        <Features />
        <AISection />
        <Technologies />
      </main>
      <Footer />
    </>
  )
}
