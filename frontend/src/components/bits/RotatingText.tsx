import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useState,
  type HTMLAttributes,
} from 'react'
import { motion, AnimatePresence } from 'motion/react'

interface RotatingTextProps
  extends Omit<HTMLAttributes<HTMLSpanElement>, 'children'> {
  texts: string[]
  transition?: Record<string, any>
  initial?: Record<string, any>
  animate?: Record<string, any>
  exit?: Record<string, any>
  animatePresenceMode?: 'sync' | 'popLayout' | 'wait'
  animatePresenceInitial?: boolean
  rotationInterval?: number
  staggerDuration?: number
  staggerFrom?: 'first' | 'last' | 'center' | 'random' | number
  loop?: boolean
  auto?: boolean
  splitBy?: 'characters' | 'words' | 'lines' | string
  onNext?: (index: number) => void
  mainClassName?: string
  splitLevelClassName?: string
  elementLevelClassName?: string
}

export interface RotatingTextRef {
  next: () => void
  previous: () => void
  jumpTo: (index: number) => void
  reset: () => void
}

function cn(
  ...classes: (string | undefined | false)[]
) {
  return classes.filter(Boolean).join(' ')
}

const RotatingText = forwardRef<
  RotatingTextRef,
  RotatingTextProps
>((props, ref) => {
  const {
    texts,

    transition = {
      type: 'spring',
      damping: 25,
      stiffness: 300,
    },

    initial = {
      y: '100%',
      opacity: 0,
    },

    animate = {
      y: 0,
      opacity: 1,
    },

    exit = {
      y: '-120%',
      opacity: 0,
    },

    animatePresenceMode = 'wait',
    animatePresenceInitial = false,
    rotationInterval = 2000,
    staggerDuration = 0,
    staggerFrom = 'first',
    loop = true,
    auto = true,
    splitBy = 'characters',
    onNext,
    mainClassName,
    splitLevelClassName,
    elementLevelClassName,

    ...rest
  } = props

  const [
    currentTextIndex,
    setCurrentTextIndex,
  ] = useState(0)

  const splitIntoCharacters = useCallback(
    (text: string) => {
      return Array.from(text)
    },
    []
  )

  const elements = useMemo(() => {
    const currentText =
      texts[currentTextIndex] ?? ''

    if (splitBy === 'characters') {
      const words = currentText.split(' ')

      return words.map((word, i) => ({
        characters: splitIntoCharacters(word),
        needsSpace:
          i !== words.length - 1,
      }))
    }

    if (splitBy === 'words') {
      return currentText
        .split(' ')
        .map((word, i, arr) => ({
          characters: [word],
          needsSpace:
            i !== arr.length - 1,
        }))
    }

    if (splitBy === 'lines') {
      return currentText
        .split('\n')
        .map((line, i, arr) => ({
          characters: [line],
          needsSpace:
            i !== arr.length - 1,
        }))
    }

    return currentText
      .split(splitBy)
      .map((part, i, arr) => ({
        characters: [part],
        needsSpace:
          i !== arr.length - 1,
      }))
  }, [
    texts,
    currentTextIndex,
    splitBy,
    splitIntoCharacters,
  ])

  const getStaggerDelay = useCallback(
    (
      index: number,
      totalChars: number
    ) => {
      if (totalChars <= 0) {
        return 0
      }

      if (staggerFrom === 'first') {
        return index * staggerDuration
      }

      if (staggerFrom === 'last') {
        return (
          (totalChars - 1 - index) *
          staggerDuration
        )
      }

      if (staggerFrom === 'center') {
        const center =
          Math.floor(totalChars / 2)

        return (
          Math.abs(center - index) *
          staggerDuration
        )
      }

      if (staggerFrom === 'random') {
        const randomIndex =
          Math.floor(
            Math.random() * totalChars
          )

        return (
          Math.abs(
            randomIndex - index
          ) * staggerDuration
        )
      }

      return (
        Math.abs(
          Number(staggerFrom) - index
        ) * staggerDuration
      )
    },
    [
      staggerFrom,
      staggerDuration,
    ]
  )

  const handleIndexChange =
    useCallback(
      (newIndex: number) => {
        setCurrentTextIndex(newIndex)

        onNext?.(newIndex)
      },
      [onNext]
    )

  const next = useCallback(() => {
    if (texts.length === 0) {
      return
    }

    const nextIndex =
      currentTextIndex ===
      texts.length - 1
        ? loop
          ? 0
          : currentTextIndex
        : currentTextIndex + 1

    if (
      nextIndex !== currentTextIndex
    ) {
      handleIndexChange(nextIndex)
    }
  }, [
    currentTextIndex,
    texts.length,
    loop,
    handleIndexChange,
  ])

  const previous = useCallback(() => {
    if (texts.length === 0) {
      return
    }

    const previousIndex =
      currentTextIndex === 0
        ? loop
          ? texts.length - 1
          : currentTextIndex
        : currentTextIndex - 1

    if (
      previousIndex !== currentTextIndex
    ) {
      handleIndexChange(
        previousIndex
      )
    }
  }, [
    currentTextIndex,
    texts.length,
    loop,
    handleIndexChange,
  ])

  const jumpTo = useCallback(
    (index: number) => {
      if (texts.length === 0) {
        return
      }

      const validIndex = Math.max(
        0,
        Math.min(
          index,
          texts.length - 1
        )
      )

      if (
        validIndex !==
        currentTextIndex
      ) {
        handleIndexChange(
          validIndex
        )
      }
    },
    [
      texts.length,
      currentTextIndex,
      handleIndexChange,
    ]
  )

  const reset = useCallback(() => {
    if (currentTextIndex !== 0) {
      handleIndexChange(0)
    }
  }, [
    currentTextIndex,
    handleIndexChange,
  ])

  useImperativeHandle(
    ref,
    () => ({
      next,
      previous,
      jumpTo,
      reset,
    }),
    [
      next,
      previous,
      jumpTo,
      reset,
    ]
  )

  useEffect(() => {
    if (
      !auto ||
      rotationInterval <= 0 ||
      texts.length <= 1
    ) {
      return
    }

    const intervalId =
      window.setInterval(
        next,
        rotationInterval
      )

    return () => {
      window.clearInterval(
        intervalId
      )
    }
  }, [
    next,
    rotationInterval,
    auto,
    texts.length,
  ])

  /*
   * IMPORTANT:
   * `rest` is applied to a NORMAL span.
   *
   * It is NOT passed to motion.span.
   *
   * This prevents normal React HTML event types
   * such as onDrag from conflicting with Motion's
   * event types.
   */

  return (
    <>
      <style>{`
        .text-rotate {
          display: flex;
          flex-wrap: wrap;
          white-space: pre-wrap;
          position: relative;
        }

        .text-rotate-sr-only {
          position: absolute;
          width: 1px;
          height: 1px;
          padding: 0;
          margin: -1px;
          overflow: hidden;
          clip: rect(0, 0, 0, 0);
          white-space: nowrap;
          border: 0;
        }

        .text-rotate-word {
          display: inline-flex;
        }

        .text-rotate-lines {
          display: flex;
          flex-direction: column;
          width: 100%;
        }

        .text-rotate-element {
          display: inline-block;
        }

        .text-rotate-space {
          white-space: pre;
        }
      `}</style>

      <span
        {...rest}
        className={cn(
          'text-rotate',
          mainClassName
        )}
      >
        <span className="text-rotate-sr-only">
          {texts[currentTextIndex]}
        </span>

        <AnimatePresence
          mode={animatePresenceMode}
          initial={
            animatePresenceInitial
          }
        >
          <motion.span
            key={currentTextIndex}
            className={cn(
              splitBy === 'lines'
                ? 'text-rotate-lines'
                : 'text-rotate'
            )}
            layout
            transition={transition}
            aria-hidden="true"
          >
            {elements.map(
              (
                wordObj,
                wordIndex,
                array
              ) => {
                const previousCharsCount =
                  array
                    .slice(
                      0,
                      wordIndex
                    )
                    .reduce(
                      (
                        sum,
                        word
                      ) =>
                        sum +
                        word
                          .characters
                          .length,
                      0
                    )

                const totalCharacters =
                  array.reduce(
                    (
                      sum,
                      word
                    ) =>
                      sum +
                      word
                        .characters
                        .length,
                    0
                  )

                return (
                  <span
                    key={wordIndex}
                    className={cn(
                      'text-rotate-word',
                      splitLevelClassName
                    )}
                  >
                    {wordObj.characters.map(
                      (
                        char,
                        charIndex
                      ) => (
                        <motion.span
                          key={
                            `${wordIndex}-${charIndex}`
                          }
                          initial={
                            initial
                          }
                          animate={
                            animate
                          }
                          exit={exit}
                          transition={{
                            ...transition,
                            delay:
                              getStaggerDelay(
                                previousCharsCount +
                                  charIndex,
                                totalCharacters
                              ),
                          }}
                          className={cn(
                            'text-rotate-element',
                            elementLevelClassName
                          )}
                        >
                          {char}
                        </motion.span>
                      )
                    )}

                    {wordObj.needsSpace && (
                      <span className="text-rotate-space">
                        {' '}
                      </span>
                    )}
                  </span>
                )
              }
            )}
          </motion.span>
        </AnimatePresence>
      </span>
    </>
  )
})

RotatingText.displayName =
  'RotatingText'

export default RotatingText