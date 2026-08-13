import React, { useState, Children, useRef, useLayoutEffect, HTMLAttributes, ReactNode } from 'react';
import { motion, AnimatePresence, Variants } from 'motion/react';
import { registerBits } from '../../debug/registry';

interface StepperProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  initialStep?: number;
  onStepChange?: (step: number) => void;
  onFinalStepCompleted?: () => void;
  stepCircleContainerClassName?: string;
  stepContainerClassName?: string;
  contentClassName?: string;
  footerClassName?: string;
  backButtonProps?: React.ButtonHTMLAttributes<HTMLButtonElement>;
  nextButtonProps?: React.ButtonHTMLAttributes<HTMLButtonElement>;
  backButtonText?: string;
  nextButtonText?: string;
  disableStepIndicators?: boolean;
  renderStepIndicator?: (props: {
    step: number;
    currentStep: number;
    onStepClick: (clicked: number) => void;
  }) => ReactNode;
}

export default function Stepper({
  children,
  initialStep = 1,
  onStepChange = () => {},
  onFinalStepCompleted = () => {},
  stepCircleContainerClassName = '',
  stepContainerClassName = '',
  contentClassName = '',
  footerClassName = '',
  backButtonProps = {},
  nextButtonProps = {},
  backButtonText = 'Back',
  nextButtonText = 'Continue',
  disableStepIndicators = false,
  renderStepIndicator,
  ...rest
}: StepperProps) {
  const [currentStep, setCurrentStep] = useState<number>(initialStep);
  const [direction, setDirection] = useState<number>(0);
  const stepsArray = Children.toArray(children);
  const totalSteps = stepsArray.length;
  const isCompleted = currentStep > totalSteps;
  const isLastStep = currentStep === totalSteps;

  React.useEffect(() => {
    registerBits('Stepper');
  }, []);

  const updateStep = (newStep: number) => {
    setCurrentStep(newStep);
    if (newStep > totalSteps) {
      onFinalStepCompleted();
    } else {
      onStepChange(newStep);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setDirection(-1);
      updateStep(currentStep - 1);
    }
  };

  const handleNext = () => {
    if (!isLastStep) {
      setDirection(1);
      updateStep(currentStep + 1);
    }
  };

  const handleComplete = () => {
    setDirection(1);
    updateStep(totalSteps + 1);
  };

  return (
    <>
      <style>{`
        .stepper {
          max-width: 560px;
          margin: 0 auto;
        }

        .stepper-card {
          padding: var(--space-6);
          border-radius: var(--radius-lg);
          background: var(--bg-surface);
          box-shadow: var(--shadow-border);
        }

        .stepper-steps {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: var(--space-6);
        }

        .stepper-indicator {
          position: relative;
          z-index: 1;
          cursor: pointer;
          -webkit-tap-highlight-color: transparent;
        }

        .stepper-indicator.is-disabled {
          cursor: default;
        }

        .stepper-indicator-circle {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 32px;
          height: 32px;
          border-radius: 50%;
          font-family: var(--font-mono);
          font-size: var(--text-caption);
          color: var(--text-on-accent);
          box-shadow: 0 0 0 1px var(--border-strong);
        }

        .stepper-indicator-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: var(--text-on-accent);
        }

        .stepper-indicator-num {
          color: var(--text-muted);
        }

        .stepper-check {
          width: 14px;
          height: 14px;
          color: var(--text-on-accent);
        }

        .stepper-connector {
          flex: 1;
          height: 2px;
          margin: 0 10px;
          border-radius: 999px;
          background: var(--border);
          overflow: hidden;
        }

        .stepper-connector-fill {
          height: 100%;
          border-radius: inherit;
        }

        .stepper-content {
          position: relative;
          overflow: hidden;
        }

        .stepper-step-content {
          padding: var(--space-4) 0;
        }

        .stepper-step-head {
          display: flex;
          align-items: baseline;
          gap: var(--space-3);
          margin-bottom: var(--space-3);
        }

        .stepper-step-mono {
          font-family: var(--font-mono);
          font-size: var(--text-micro);
          letter-spacing: 0.06em;
          color: var(--accent-text);
        }

        .stepper-step-title {
          font-size: var(--text-h3);
          font-weight: 600;
          line-height: var(--leading-h3);
          letter-spacing: var(--tracking-h3);
          color: var(--text-primary);
        }

        .stepper-step-text {
          font-size: var(--text-sm);
          line-height: var(--leading-relaxed);
          letter-spacing: var(--tracking-body);
          color: var(--text-secondary);
          text-wrap: pretty;
        }

        .stepper-footer {
          margin-top: var(--space-4);
        }

        .stepper-footer-actions {
          display: flex;
          justify-content: flex-end;
          gap: var(--space-3);
        }
      `}</style>

      <div className="stepper" {...rest}>
      <div className={`stepper-card${stepCircleContainerClassName ? ` ${stepCircleContainerClassName}` : ''}`}>
        <div className={`stepper-steps${stepContainerClassName ? ` ${stepContainerClassName}` : ''}`}>
          {stepsArray.map((_, index) => {
            const stepNumber = index + 1;
            const isNotLastStep = index < totalSteps - 1;
            return (
              <React.Fragment key={stepNumber}>
                {renderStepIndicator ? (
                  renderStepIndicator({
                    step: stepNumber,
                    currentStep,
                    onStepClick: clicked => {
                      setDirection(clicked > currentStep ? 1 : -1);
                      updateStep(clicked);
                    },
                  })
                ) : (
                  <StepIndicator
                    step={stepNumber}
                    disableStepIndicators={disableStepIndicators}
                    currentStep={currentStep}
                    onClickStep={clicked => {
                      setDirection(clicked > currentStep ? 1 : -1);
                      updateStep(clicked);
                    }}
                  />
                )}
                {isNotLastStep && <StepConnector isComplete={currentStep > stepNumber} />}
              </React.Fragment>
            );
          })}
        </div>

        <StepContentWrapper
          isCompleted={isCompleted}
          currentStep={currentStep}
          direction={direction}
          className={`stepper-content${contentClassName ? ` ${contentClassName}` : ''}`}
        >
          {stepsArray[currentStep - 1]}
        </StepContentWrapper>

        {!isCompleted && (
          <div className={`stepper-footer${footerClassName ? ` ${footerClassName}` : ''}`}>
            <div className={`stepper-footer-actions${currentStep !== 1 ? ' has-back' : ''}`}>
              {currentStep !== 1 && (
                <button
                  onClick={handleBack}
                  className="btn btn-ghost"
                  {...backButtonProps}
                >
                  {backButtonText}
                </button>
              )}
              <button
                onClick={isLastStep ? handleComplete : handleNext}
                className="btn btn-primary"
                {...nextButtonProps}
              >
                {isLastStep ? 'Complete' : nextButtonText}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
    </>
  );
}

interface StepContentWrapperProps {
  isCompleted: boolean;
  currentStep: number;
  direction: number;
  children: ReactNode;
  className?: string;
}

function StepContentWrapper({
  isCompleted,
  currentStep,
  direction,
  children,
  className = '',
}: StepContentWrapperProps) {
  const [parentHeight, setParentHeight] = useState<number>(0);

  return (
    <motion.div
      style={{ position: 'relative', overflow: 'hidden' }}
      animate={{ height: isCompleted ? 0 : parentHeight }}
      transition={{ type: 'spring', duration: 0.4 }}
      className={className}
    >
      <AnimatePresence initial={false} mode="sync" custom={direction}>
        {!isCompleted && (
          <SlideTransition key={currentStep} direction={direction} onHeightReady={h => setParentHeight(h)}>
            {children}
          </SlideTransition>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

interface SlideTransitionProps {
  children: ReactNode;
  direction: number;
  onHeightReady: (height: number) => void;
}

function SlideTransition({ children, direction, onHeightReady }: SlideTransitionProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);

  useLayoutEffect(() => {
    if (containerRef.current) {
      onHeightReady(containerRef.current.offsetHeight);
    }
  }, [children, onHeightReady]);

  return (
    <motion.div
      ref={containerRef}
      custom={direction}
      variants={stepVariants}
      initial="enter"
      animate="center"
      exit="exit"
      transition={{ duration: 0.4 }}
      style={{ position: 'absolute', left: 0, right: 0, top: 0 }}
    >
      {children}
    </motion.div>
  );
}

const stepVariants: Variants = {
  enter: (dir: number) => ({
    x: dir >= 0 ? '-100%' : '100%',
    opacity: 0,
  }),
  center: {
    x: '0%',
    opacity: 1,
  },
  exit: (dir: number) => ({
    x: dir >= 0 ? '50%' : '-50%',
    opacity: 0,
  }),
};

interface StepProps {
  children: ReactNode;
}

export function Step({ children }: StepProps) {
  return <div className="stepper-step-content">{children}</div>;
}

interface StepIndicatorProps {
  step: number;
  currentStep: number;
  onClickStep: (clicked: number) => void;
  disableStepIndicators?: boolean;
}

function StepIndicator({ step, currentStep, onClickStep, disableStepIndicators = false }: StepIndicatorProps) {
  const status = currentStep === step ? 'active' : currentStep < step ? 'inactive' : 'complete';

  const handleClick = () => {
    if (step !== currentStep && !disableStepIndicators) {
      onClickStep(step);
    }
  };

  return (
    <motion.div
      onClick={handleClick}
      className={`stepper-indicator${disableStepIndicators ? ' is-disabled' : ''}`}
      animate={status}
      initial={false}
    >
      <motion.div
        variants={{
          inactive: { scale: 1, backgroundColor: 'var(--bg-inset)' },
          active: { scale: 1, backgroundColor: 'var(--accent)' },
          complete: { scale: 1, backgroundColor: 'var(--accent)' },
        }}
        transition={{ duration: 0.3 }}
        className="stepper-indicator-circle"
      >
        {status === 'complete' ? (
          <CheckIcon className="stepper-check" />
        ) : status === 'active' ? (
          <span className="stepper-indicator-dot" />
        ) : (
          <span className="stepper-indicator-num">{step}</span>
        )}
      </motion.div>
    </motion.div>
  );
}

interface StepConnectorProps {
  isComplete: boolean;
}

function StepConnector({ isComplete }: StepConnectorProps) {
  const lineVariants: Variants = {
    incomplete: { width: 0, backgroundColor: 'transparent' },
    complete: { width: '100%', backgroundColor: 'var(--accent)' },
  };

  return (
    <div className="stepper-connector">
      <motion.div
        className="stepper-connector-fill"
        variants={lineVariants}
        initial={false}
        animate={isComplete ? 'complete' : 'incomplete'}
        transition={{ duration: 0.4 }}
      />
    </div>
  );
}

interface CheckIconProps extends React.SVGProps<SVGSVGElement> {}

function CheckIcon(props: CheckIconProps) {
  return (
    <svg {...props} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
      <motion.path
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{
          delay: 0.1,
          type: 'tween',
          ease: 'easeOut',
          duration: 0.3,
        }}
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M5 13l4 4L19 7"
      />
    </svg>
  );
}
