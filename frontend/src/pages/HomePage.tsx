import { useRef, useState } from 'react'
import Navbar from '../components/Navbar'
import Hero from '../components/Hero'
import Features from '../components/Features'
import RepositoryAnalyzer from '../components/RepositoryAnalyzer'
import SearchSection from '../components/SearchSection'
import CodebaseQA from '../components/CodebaseQA'
import Footer from '../components/Footer'
import OfflineBanner from '../components/OfflineBanner'
import { useHealth } from '../hooks/useHealth'

export default function HomePage() {
  const [analyzedRepository, setAnalyzedRepository] = useState<string | null>(null)
  const [heroUrl, setHeroUrl] = useState('')
  const [bannerDismissed, setBannerDismissed] = useState(false)
  const { state, health, recheck } = useHealth()
  const analyzerSectionRef = useRef<HTMLDivElement>(null)

  function handleAnalyzeRequest(url: string) {
    setHeroUrl(url)
    analyzerSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  function handleRepositoryChange(repository: string | null) {
    setAnalyzedRepository(repository)
  }

  return (
    <>
      <Navbar
        repository={analyzedRepository}
        backendState={state}
        health={health}
      />
      <OfflineBanner
        visible={state === 'offline' && !bannerDismissed}
        onDismiss={() => setBannerDismissed(true)}
        onRetry={() => {
          setBannerDismissed(false)
          recheck()
        }}
      />
      <main>
        <Hero onAnalyzeRequest={handleAnalyzeRequest} />
        <Features />
        <div ref={analyzerSectionRef}>
          <RepositoryAnalyzer
            onRepositoryChange={handleRepositoryChange}
            initialUrl={heroUrl}
          />
        </div>
        <SearchSection repository={analyzedRepository} />
        <CodebaseQA repository={analyzedRepository} />
      </main>
      <Footer backendState={state} health={health} />
    </>
  )
}
