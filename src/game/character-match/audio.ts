export type MatchSoundType =
  | 'clear'
  | 'danger'
  | 'hint'
  | 'miss'
  | 'restart'
  | 'select'
  | 'shuffle'
  | 'special'
  | 'upgrade'

let audioContext: AudioContext | null = null

export function playCharacterMatchSound(
  type: MatchSoundType,
  enabled: boolean,
) {
  if (!enabled || typeof window === 'undefined') return

  try {
    audioContext ??= new window.AudioContext()
    if (audioContext.state === 'suspended') {
      void audioContext.resume()
    }

    playPattern(audioContext, type)
  } catch {
    audioContext = null
  }
}

function playPattern(context: AudioContext, type: MatchSoundType) {
  const now = context.currentTime

  if (type === 'select') {
    tone(context, now, 0.07, 620, 820, 'sine', 0.035)
    return
  }

  if (type === 'hint') {
    const frequencies = [720, 920, 1180]
    frequencies.forEach((frequency, index) => {
      tone(context, now + index * 0.055, 0.11, frequency, frequency * 1.05)
    })
    return
  }

  if (type === 'miss') {
    tone(context, now, 0.14, 170, 105, 'triangle', 0.045)
    noise(context, now, 0.08, 360, 0.018)
    return
  }

  if (type === 'shuffle') {
    noise(context, now, 0.16, 1100, 0.034)
    tone(context, now + 0.02, 0.16, 260, 520, 'sawtooth', 0.025)
    return
  }

  if (type === 'restart') {
    tone(context, now, 0.1, 460, 330, 'triangle', 0.036)
    tone(context, now + 0.075, 0.13, 590, 390, 'triangle', 0.03)
    return
  }

  if (type === 'danger') {
    tone(context, now, 0.22, 150, 82, 'sawtooth', 0.048)
    noise(context, now + 0.02, 0.18, 220, 0.02)
    return
  }

  if (type === 'upgrade') {
    tone(context, now, 0.2, 520, 1040, 'triangle', 0.04)
    tone(context, now + 0.12, 0.16, 1320, 1560, 'sine', 0.028)
    return
  }

  if (type === 'special') {
    tone(context, now, 0.24, 220, 150, 'sawtooth', 0.035)
    const frequencies = [740, 990, 1320, 1760]
    frequencies.forEach((frequency, index) => {
      tone(
        context,
        now + 0.045 + index * 0.052,
        0.16,
        frequency,
        frequency * 1.08,
      )
    })
    noise(context, now + 0.03, 0.24, 1700, 0.035)
    return
  }

  const frequencies = [520, 660, 880]
  frequencies.forEach((frequency, index) => {
    tone(context, now + index * 0.045, 0.13, frequency, frequency * 1.08)
  })
  noise(context, now + 0.02, 0.14, 1200, 0.022)
}

function tone(
  context: AudioContext,
  start: number,
  duration: number,
  frequency: number,
  endFrequency: number,
  type: OscillatorType = 'sine',
  volume = 0.032,
) {
  const oscillator = context.createOscillator()
  const gain = context.createGain()

  oscillator.type = type
  oscillator.frequency.setValueAtTime(frequency, start)
  oscillator.frequency.exponentialRampToValueAtTime(
    Math.max(24, endFrequency),
    start + duration,
  )

  gain.gain.setValueAtTime(0.0001, start)
  gain.gain.exponentialRampToValueAtTime(volume, start + 0.012)
  gain.gain.exponentialRampToValueAtTime(0.0001, start + duration)

  oscillator.connect(gain)
  gain.connect(context.destination)
  oscillator.start(start)
  oscillator.stop(start + duration + 0.03)
}

function noise(
  context: AudioContext,
  start: number,
  duration: number,
  frequency: number,
  volume: number,
) {
  const sampleCount = Math.max(1, Math.floor(context.sampleRate * duration))
  const buffer = context.createBuffer(1, sampleCount, context.sampleRate)
  const data = buffer.getChannelData(0)

  for (let index = 0; index < sampleCount; index += 1) {
    data[index] = (Math.random() * 2 - 1) * (1 - index / sampleCount)
  }

  const source = context.createBufferSource()
  const filter = context.createBiquadFilter()
  const gain = context.createGain()

  source.buffer = buffer
  filter.type = 'bandpass'
  filter.frequency.setValueAtTime(frequency, start)
  filter.Q.setValueAtTime(6, start)

  gain.gain.setValueAtTime(0.0001, start)
  gain.gain.exponentialRampToValueAtTime(volume, start + 0.01)
  gain.gain.exponentialRampToValueAtTime(0.0001, start + duration)

  source.connect(filter)
  filter.connect(gain)
  gain.connect(context.destination)
  source.start(start)
  source.stop(start + duration + 0.02)
}
