import Container from './Container'
import FadeContent from './bits/FadeContent'
import TiltCard from './bits/TiltCard'
import SpotlightCard from './bits/SpotlightCard'
import { BookIcon, CodeIcon, SearchIcon } from './icons'

const FEATURES = [
  {
    icon: CodeIcon,
    title: 'Repository intelligence',
    description:
      'Connect any public GitHub repository. DevDocs AI fetches, chunks, and embeds the source so files and structure become searchable documentation.',
  },
  {
    icon: SearchIcon,
    title: 'Semantic code search',
    description:
      'Search by intent, not keywords. Describe what you are looking for and jump straight to the files and line ranges that matter.',
  },
  {
    icon: BookIcon,
    title: 'Grounded Q&A',
    description:
      'Ask questions in plain language. Every answer is generated from your real code and backed by source citations with file paths and line numbers.',
  },
]

export default function Features() {
  return (
    <section className="section features" id="features">
      <Container>
        <FadeContent duration={600} threshold={0.1}>
          <div className="section-heading">
            <p className="eyebrow">Capabilities</p>
            <h2 className="section-title">Built for developers who ship</h2>
            <p className="section-subtitle">
              Stop reading every file to find an answer. DevDocs AI turns your repository
              into a living knowledge base.
            </p>
          </div>
        </FadeContent>
        <div className="features-grid">
          {FEATURES.map((feature, index) => (
            <FadeContent
              key={feature.title}
              duration={500}
              delay={index * 100}
              threshold={0.15}
              initialScale={0.96}
            >
              <TiltCard className="feature-tilt" maxTilt={8}>
                <SpotlightCard className="spotlight-feature">
                  <div className="feature-card">
                    <div className="feature-icon" aria-hidden="true">
                      <feature.icon size={19} />
                    </div>
                    <h3 className="feature-title">{feature.title}</h3>
                    <p className="feature-description">{feature.description}</p>
                  </div>
                </SpotlightCard>
              </TiltCard>
            </FadeContent>
          ))}
        </div>
      </Container>
    </section>
  )
}
