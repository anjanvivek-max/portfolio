/**
 * All sound is synthesised with the Web Audio API: there are no audio files and nothing
 * copyrighted. Sound is off by default and the AudioContext is only created after the
 * visitor presses the sound button (a user gesture), as browsers require.
 */

export type SoundName = 'click' | 'pickup' | 'insert' | 'crtOn' | 'eject'

let ctx: AudioContext | null = null
let master: GainNode | null = null
let noiseBuffer: AudioBuffer | null = null
let muted = true
let ambientNodes: { stop: () => void } | null = null
let ambientWanted = false

const ensure = (): AudioContext | null => {
  if (muted) return null
  if (!ctx) {
    const Ctor = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
    if (!Ctor) return null
    try {
      ctx = new Ctor()
    } catch {
      return null
    }
    master = ctx.createGain()
    master.gain.value = 0.55
    master.connect(ctx.destination)
    const length = ctx.sampleRate * 2
    noiseBuffer = ctx.createBuffer(1, length, ctx.sampleRate)
    const data = noiseBuffer.getChannelData(0)
    for (let i = 0; i < length; i++) data[i] = Math.random() * 2 - 1
  }
  if (ctx.state === 'suspended') void ctx.resume()
  return ctx
}

/** A short burst of filtered noise with an exponential decay. */
const noise = (
  ac: AudioContext,
  at: number,
  length: number,
  gain: number,
  filterType: BiquadFilterType,
  frequency: number,
  q = 0.8,
) => {
  if (!noiseBuffer || !master) return
  const src = ac.createBufferSource()
  src.buffer = noiseBuffer
  src.loop = true
  const filter = ac.createBiquadFilter()
  filter.type = filterType
  filter.frequency.value = frequency
  filter.Q.value = q
  const g = ac.createGain()
  g.gain.setValueAtTime(0.0001, at)
  g.gain.exponentialRampToValueAtTime(gain, at + 0.008)
  g.gain.exponentialRampToValueAtTime(0.0001, at + length)
  src.connect(filter).connect(g).connect(master)
  src.start(at, Math.random())
  src.stop(at + length + 0.05)
}

/** A simple enveloped oscillator, optionally sweeping in pitch. */
const tone = (
  ac: AudioContext,
  at: number,
  length: number,
  gain: number,
  type: OscillatorType,
  from: number,
  to = from,
) => {
  if (!master) return
  const osc = ac.createOscillator()
  osc.type = type
  osc.frequency.setValueAtTime(from, at)
  if (to !== from) osc.frequency.exponentialRampToValueAtTime(to, at + length)
  const g = ac.createGain()
  g.gain.setValueAtTime(0.0001, at)
  g.gain.exponentialRampToValueAtTime(gain, at + 0.012)
  g.gain.exponentialRampToValueAtTime(0.0001, at + length)
  osc.connect(g).connect(master)
  osc.start(at)
  osc.stop(at + length + 0.05)
}

const recipes: Record<SoundName, (ac: AudioContext, t: number) => void> = {
  // Soft plastic button.
  click: (ac, t) => {
    noise(ac, t, 0.035, 0.22, 'highpass', 2200)
    tone(ac, t, 0.05, 0.05, 'triangle', 620, 380)
  },
  // Tape lifted from the rack: a light plastic rattle.
  pickup: (ac, t) => {
    noise(ac, t, 0.06, 0.2, 'bandpass', 1800, 1.4)
    noise(ac, t + 0.07, 0.05, 0.12, 'bandpass', 2600, 1.6)
  },
  // Tape travels, slides into the slot, the transport pulls it in and locks.
  insert: (ac, t) => {
    noise(ac, t + 0.85, 0.16, 0.2, 'bandpass', 900, 1.2) // slide
    tone(ac, t + 1.0, 0.42, 0.05, 'sawtooth', 70, 110) // loading motor
    noise(ac, t + 1.0, 0.42, 0.06, 'bandpass', 420, 2.5)
    noise(ac, t + 1.42, 0.12, 0.5, 'lowpass', 320) // clunk
    tone(ac, t + 1.42, 0.14, 0.2, 'sine', 95, 55)
  },
  // Degauss thump, rising line whine, a breath of static.
  crtOn: (ac, t) => {
    tone(ac, t, 0.35, 0.3, 'sine', 62, 40)
    noise(ac, t, 0.05, 0.3, 'lowpass', 500)
    tone(ac, t + 0.05, 1.1, 0.012, 'sine', 9000, 11500)
    noise(ac, t + 0.35, 0.75, 0.07, 'bandpass', 3200, 0.6)
  },
  // Motor pushes the tape out; screen collapses.
  eject: (ac, t) => {
    noise(ac, t, 0.08, 0.3, 'lowpass', 380)
    tone(ac, t + 0.02, 0.2, 0.08, 'sine', 420, 60)
    tone(ac, t + 0.12, 0.5, 0.05, 'sawtooth', 110, 68)
    noise(ac, t + 0.12, 0.5, 0.06, 'bandpass', 520, 2.2)
    noise(ac, t + 0.62, 0.1, 0.28, 'bandpass', 1100, 1.1)
  },
}

const startAmbient = () => {
  const ac = ensure()
  if (!ac || !master || !noiseBuffer || ambientNodes) return
  // Room tone: very quiet low-passed noise plus a faint mains hum.
  const src = ac.createBufferSource()
  src.buffer = noiseBuffer
  src.loop = true
  const lp = ac.createBiquadFilter()
  lp.type = 'lowpass'
  lp.frequency.value = 240
  const g = ac.createGain()
  g.gain.setValueAtTime(0.0001, ac.currentTime)
  g.gain.exponentialRampToValueAtTime(0.05, ac.currentTime + 2)
  src.connect(lp).connect(g).connect(master)
  src.start()

  const hum = ac.createOscillator()
  hum.type = 'sine'
  hum.frequency.value = 100
  const hg = ac.createGain()
  hg.gain.value = 0.006
  hum.connect(hg).connect(master)
  hum.start()

  ambientNodes = {
    stop: () => {
      const now = ac.currentTime
      g.gain.cancelScheduledValues(now)
      g.gain.setTargetAtTime(0.0001, now, 0.15)
      hg.gain.setTargetAtTime(0.0001, now, 0.15)
      src.stop(now + 0.8)
      hum.stop(now + 0.8)
    },
  }
}

const stopAmbient = () => {
  ambientNodes?.stop()
  ambientNodes = null
}

export const sound = {
  setMuted(value: boolean) {
    muted = value
    if (muted) {
      stopAmbient()
      if (ctx && ctx.state === 'running') void ctx.suspend()
    } else {
      ensure()
      if (ambientWanted) startAmbient()
    }
  },
  play(name: SoundName) {
    const ac = ensure()
    if (!ac) return
    try {
      recipes[name](ac, ac.currentTime + 0.01)
    } catch {
      /* audio is optional: never let it break an interaction */
    }
  },
  ambient(on: boolean) {
    ambientWanted = on
    if (on) startAmbient()
    else stopAmbient()
  },
}
