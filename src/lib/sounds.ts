// Cheerful, gentle Web Audio API sound synthesizer
let audioCtx: AudioContext | null = null

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
    if (AudioContextClass) {
      audioCtx = new AudioContextClass()
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume()
  }
  return audioCtx
}

export const soundEffects = {
  // Soft gentle click/tap for tab switches
  tap: () => {
    try {
      const ctx = getAudioContext()
      if (!ctx) return
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.type = 'sine'
      const now = ctx.currentTime
      osc.frequency.setValueAtTime(320, now)
      osc.frequency.exponentialRampToValueAtTime(440, now + 0.05)
      gain.gain.setValueAtTime(0.06, now)
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05)
      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.start(now)
      osc.stop(now + 0.05)
    } catch {
      // Ignore
    }
  },

  // Gentle bubble pop when adding a pouch
  pop: () => {
    try {
      const ctx = getAudioContext()
      if (!ctx) return
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.type = 'sine'
      const now = ctx.currentTime
      osc.frequency.setValueAtTime(420, now)
      osc.frequency.exponentialRampToValueAtTime(840, now + 0.08)
      gain.gain.setValueAtTime(0.12, now)
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08)
      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.start(now)
      osc.stop(now + 0.08)
    } catch {
      // Ignore audio context errors silently
    }
  },

  // Soft swoosh when removing
  whoosh: () => {
    try {
      const ctx = getAudioContext()
      if (!ctx) return
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.type = 'sine'
      const now = ctx.currentTime
      osc.frequency.setValueAtTime(600, now)
      osc.frequency.exponentialRampToValueAtTime(280, now + 0.09)
      gain.gain.setValueAtTime(0.08, now)
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.09)
      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.start(now)
      osc.stop(now + 0.09)
    } catch {
      // Ignore
    }
  },

  // Cheerful chime when completing box or applying promo
  chime: () => {
    try {
      const ctx = getAudioContext()
      if (!ctx) return
      const notes = [523.25, 659.25, 783.99, 1046.5] // C5, E5, G5, C6
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator()
        const gain = ctx.createGain()
        osc.type = 'triangle'
        const now = ctx.currentTime + idx * 0.07
        osc.frequency.setValueAtTime(freq, now)
        gain.gain.setValueAtTime(0.1, now)
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25)
        osc.connect(gain)
        gain.connect(ctx.destination)
        osc.start(now)
        osc.stop(now + 0.25)
      })
    } catch {
      // Ignore
    }
  },

  // Celebratory fanfare on successful checkout
  fanfare: () => {
    try {
      const ctx = getAudioContext()
      if (!ctx) return
      const notes = [
        { f: 523.25, d: 0.1, delay: 0 },
        { f: 659.25, d: 0.1, delay: 0.1 },
        { f: 783.99, d: 0.12, delay: 0.2 },
        { f: 1046.5, d: 0.4, delay: 0.32 },
        { f: 1318.5, d: 0.5, delay: 0.45 },
      ]
      notes.forEach(({ f, d, delay }) => {
        const osc = ctx.createOscillator()
        const gain = ctx.createGain()
        osc.type = 'sine'
        const now = ctx.currentTime + delay
        osc.frequency.setValueAtTime(f, now)
        gain.gain.setValueAtTime(0.12, now)
        gain.gain.exponentialRampToValueAtTime(0.001, now + d)
        osc.connect(gain)
        gain.connect(ctx.destination)
        osc.start(now)
        osc.stop(now + d)
      })
    } catch {
      // Ignore
    }
  }
}
