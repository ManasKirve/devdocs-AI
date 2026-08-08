import Container from './Container'

const TECHNOLOGIES = ['React', 'TypeScript', 'Python', 'FastAPI', 'Grok', 'PostgreSQL', 'RAG']

export default function Technologies() {
  return (
    <section className="section technologies" id="technologies">
      <Container>
        <div className="section-heading">
          <p className="eyebrow">Stack</p>
          <h2 className="section-title">Powered by a modern stack</h2>
          <p className="section-subtitle">
            Built with the tools developers already trust.
          </p>
        </div>
        <ul className="technologies-grid">
          {TECHNOLOGIES.map((tech) => (
            <li className="technology" key={tech}>
              <span className="technology-dot" aria-hidden="true" />
              {tech}
            </li>
          ))}
        </ul>
      </Container>
    </section>
  )
}
