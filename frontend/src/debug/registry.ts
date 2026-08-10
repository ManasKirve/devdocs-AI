const mounted = new Set<string>()
const listeners = new Set<() => void>()

export function registerBits(name: string) {
  mounted.add(name)
  for (const listener of listeners) listener()
}

export function getMountedBits(): string[] {
  return Array.from(mounted)
}

export function subscribeBits(listener: () => void): () => void {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}
