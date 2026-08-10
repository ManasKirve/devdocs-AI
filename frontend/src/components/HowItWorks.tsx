import Container from './Container'
import FadeContent from './bits/FadeContent'
import ScrollReveal from './bits/ScrollReveal'
import Stepper, { Step } from './bits/Stepper'

const STEPS = [
  {
    label: 'Connect',
    detail:
      'Paste a public GitHub repository URL. DevDocs AI clones the source and maps its structure.',
  },
  {
    label: 'Index',
    detail:
      'Files are chunked, embedded, and written to the vector index — ready for retrieval.',
  },
  {
    label: 'Search',
    detail:
      'Describe what you need in plain language. Semantic search returns the exact files and line ranges.',
  },
  {
    label: 'Ask',
    detail:
      'Ask follow-up questions. Answers are generated from your code and cited to file + line.',
  },
]

export default function HowItWorks() {
  return (
    <section className="section how-it-works" id="how-it-works">
      <Container>
        <FadeContent duration={600} threshold={0.1}>
          <div className="section-heading">
            <p className="eyebrow">Workflow</p>
            <ScrollReveal as="h2" className="section-title">
              From repository to answers
            </ScrollReveal>
            <p className="section-subtitle">
              Four steps, no configuration, no setup. DevDocs AI does the heavy lifting
              between a GitHub URL and a grounded answer.
            </p>
          </div>
        </FadeContent>

        <FadeContent duration={600} delay={120} threshold={0.1}>
          <Stepper backButtonText="Back" nextButtonText="Continue">
            {STEPS.map((step, index) => (
              <Step key={step.label}>
                <div className="stepper-step-head">
                  <span className="stepper-step-mono" aria-hidden="true">
                    0{index + 1}
                  </span>
                  <h3 className="stepper-step-title">{step.label}</h3>
                </div>
                <p className="stepper-step-text">{step.detail}</p>
              </Step>
            ))}
          </Stepper>
        </FadeContent>
      </Container>
    </section>
  )
}
