import Container from './Container'
import { BookIcon, CodeIcon, SearchIcon } from './icons'

const FEATURES = [
  {
    icon: CodeIcon,
    title: 'Codebase Intelligence',
    description:
      'Get architectural insight across your entire stack. DevDocs AI maps modules, dependencies, and data flow so you can onboard and ship faster.',
  },
  {
    icon: BookIcon,
    title: 'AI Documentation',
    description:
      'Generate accurate, up-to-date documentation from your real code. Keep your team aligned without stale hand-written references.',
  },
  {
    icon: SearchIcon,
    title: 'Developer Search',
    description:
      'Find functions, services, and schemas by intent. Ask in plain language and jump straight to the code that matters.',
  },
]

export default function Features() {
  return (
    <section className="section features" id="features">
      <Container>
        <div className="section-heading">
          <p className="eyebrow">Capabilities</p>
          <h2 className="section-title">Built for serious teams</h2>
          <p className="section-subtitle">
            DevDocs AI turns your repository into a living knowledge base.
          </p>
        </div>
        <div className="features-grid">
          {FEATURES.map((feature) => (
            <article className="feature-card" key={feature.title}>
              <div className="feature-icon" aria-hidden="true">
                <feature.icon size={20} />
              </div>
              <h3 className="feature-title">{feature.title}</h3>
              <p className="feature-description">{feature.description}</p>
            </article>
          ))}
        </div>
      </Container>
    </section>
  )
}
