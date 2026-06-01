import type { CollectibleKind } from '../core/types'

type AudioContextFactory = typeof AudioContext
type OscillatorWave = OscillatorType

interface ToneOptions {
  readonly type?: OscillatorWave
  readonly frequency: number
  readonly endFrequency?: number
  readonly duration: number
  readonly gain?: number
  readonly attack?: number
  readonly release?: number
}

const clamp = (value: number, min: number, max: number) =>
  Math.max(min, Math.min(max, value))

const getAudioContextFactory = (): AudioContextFactory => window.AudioContext

export default class SoundEffects {
  private context: AudioContext | null = null

  private masterGain: GainNode | null = null

  private ambienceGain: GainNode | null = null

  private windFilter: BiquadFilterNode | null = null

  private windSource: AudioBufferSourceNode | null = null

  private running = false

  private unlocked = false

  private muted = false

  private warningCooldownUntil = 0

  setMuted(muted: boolean): void {
    this.muted = muted
    if (this.masterGain) {
      this.masterGain.gain.value = muted ? 0 : 0.58
    }
    if (!muted && this.running) {
      this.unlock()
      this.setSpeedRatio(0.42)
    }
  }

  unlock(): void {
    if (this.muted) return
    const context = this.ensureContext()
    if (!context) return
    this.unlocked = true
    void context.resume()
    this.startAmbience()
  }

  setRunning(running: boolean): void {
    this.running = running
    if (this.muted) return
    this.unlock()
    this.setSpeedRatio(running ? 0.42 : 0)
  }

  setSpeedRatio(ratio: number): void {
    const context = this.context
    if (!context || !this.ambienceGain || !this.windFilter) return
    const now = context.currentTime
    const normalized = clamp(ratio, 0, 1.5)
    const targetGain = this.running ? 0.016 + normalized * 0.035 : 0.002
    this.ambienceGain.gain.cancelScheduledValues(now)
    this.ambienceGain.gain.setTargetAtTime(targetGain, now, 0.24)
    this.windFilter.frequency.cancelScheduledValues(now)
    this.windFilter.frequency.setTargetAtTime(
      760 + normalized * 1650,
      now,
      0.35,
    )
  }

  playStart(): void {
    if (this.muted) return
    this.unlock()
    this.playTone({
      type: 'sine',
      frequency: 164,
      endFrequency: 246,
      duration: 0.5,
      gain: 0.075,
      release: 0.3,
    })
    this.playTone({
      type: 'triangle',
      frequency: 492,
      endFrequency: 738,
      duration: 0.42,
      gain: 0.035,
      attack: 0.04,
    })
  }

  playMove(vertical = false): void {
    if (this.muted) return
    this.unlock()
    this.playTone({
      type: 'triangle',
      frequency: vertical ? 410 : 330,
      endFrequency: vertical ? 620 : 470,
      duration: 0.13,
      gain: 0.032,
      attack: 0.008,
      release: 0.08,
    })
  }

  playDash(): void {
    if (this.muted) return
    this.unlock()
    this.playTone({
      type: 'sawtooth',
      frequency: 180,
      endFrequency: 860,
      duration: 0.22,
      gain: 0.055,
      attack: 0.006,
    })
    this.playTone({
      type: 'sine',
      frequency: 880,
      endFrequency: 1320,
      duration: 0.34,
      gain: 0.035,
      attack: 0.02,
    })
    this.playNoise(0.2, 0.035, 2400, 'highpass')
  }

  playBoostStart(): void {
    if (this.muted) return
    this.unlock()
    this.playTone({
      type: 'triangle',
      frequency: 260,
      endFrequency: 520,
      duration: 0.18,
      gain: 0.03,
    })
  }

  playPickup(kind: CollectibleKind): void {
    if (this.muted) return
    this.unlock()
    const base =
      kind === 'elixir'
        ? 660
        : kind === 'talisman'
          ? 540
          : kind === 'sword-energy'
            ? 880
            : 720
    this.playTone({
      type: 'sine',
      frequency: base,
      endFrequency: base * 1.5,
      duration: 0.16,
      gain: 0.04,
    })
    this.playTone({
      type: 'triangle',
      frequency: base * 1.5,
      duration: 0.18,
      gain: 0.026,
      attack: 0.04,
    })
  }

  playShield(): void {
    if (this.muted) return
    this.unlock()
    this.playTone({
      type: 'sine',
      frequency: 392,
      endFrequency: 784,
      duration: 0.28,
      gain: 0.044,
    })
    this.playTone({
      type: 'triangle',
      frequency: 1176,
      endFrequency: 880,
      duration: 0.22,
      gain: 0.025,
    })
  }

  playNearMiss(): void {
    if (this.muted) return
    this.unlock()
    this.playTone({
      type: 'triangle',
      frequency: 520,
      endFrequency: 920,
      duration: 0.12,
      gain: 0.028,
      attack: 0.006,
    })
    this.playNoise(0.12, 0.018, 1800, 'highpass')
  }

  playCombo(multiplier: number): void {
    if (this.muted) return
    this.unlock()
    const lift = Math.min(1.2, Math.max(0, multiplier - 1))
    const base = 740 + lift * 220
    this.playTone({
      type: 'sine',
      frequency: base,
      endFrequency: base * 1.42,
      duration: 0.16,
      gain: 0.026,
    })
  }

  playMilestone(): void {
    if (this.muted) return
    this.unlock()
    this.playTone({
      type: 'triangle',
      frequency: 392,
      endFrequency: 784,
      duration: 0.2,
      gain: 0.038,
    })
    window.setTimeout(() => {
      this.playTone({
        type: 'sine',
        frequency: 988,
        endFrequency: 1318,
        duration: 0.22,
        gain: 0.03,
      })
    }, 120)
  }

  playHit(): void {
    if (this.muted) return
    this.unlock()
    this.playTone({
      type: 'sawtooth',
      frequency: 150,
      endFrequency: 72,
      duration: 0.24,
      gain: 0.075,
      release: 0.12,
    })
    this.playNoise(0.16, 0.045, 720, 'lowpass')
  }

  playRescue(): void {
    if (this.muted) return
    this.unlock()
    this.playNoise(0.34, 0.034, 980, 'bandpass')
    this.playTone({
      type: 'triangle',
      frequency: 196,
      endFrequency: 587,
      duration: 0.38,
      gain: 0.052,
      release: 0.2,
    })
    window.setTimeout(() => {
      this.playTone({
        type: 'sine',
        frequency: 784,
        endFrequency: 1176,
        duration: 0.28,
        gain: 0.03,
      })
    }, 170)
  }

  playWarning(level = 1): void {
    if (this.muted) return
    const nowMs = performance.now()
    if (nowMs < this.warningCooldownUntil) return
    this.warningCooldownUntil = nowMs + (level >= 3 ? 620 : 880)
    this.unlock()
    const high = level >= 3 ? 820 : level >= 2 ? 720 : 620
    this.playTone({
      type: 'square',
      frequency: high,
      endFrequency: high * 0.72,
      duration: 0.11,
      gain: 0.028,
      release: 0.05,
    })
    if (level >= 2) {
      window.setTimeout(() => {
        this.playTone({
          type: 'square',
          frequency: high * 0.84,
          endFrequency: high * 0.58,
          duration: 0.11,
          gain: 0.024,
          release: 0.05,
        })
      }, 135)
    }
    if (level >= 3) {
      this.playNoise(0.28, 0.035, 420, 'lowpass')
    }
  }

  playGameOver(): void {
    if (this.muted) return
    this.unlock()
    this.setRunning(false)
    this.playTone({
      type: 'triangle',
      frequency: 294,
      endFrequency: 196,
      duration: 0.34,
      gain: 0.052,
      release: 0.22,
    })
    window.setTimeout(() => {
      this.playTone({
        type: 'sine',
        frequency: 196,
        endFrequency: 98,
        duration: 0.48,
        gain: 0.045,
        release: 0.3,
      })
    }, 120)
  }

  dispose(): void {
    this.running = false
    try {
      this.windSource?.stop()
    } catch {
      // AudioBufferSourceNode throws if it was already stopped.
    }

    this.windSource?.disconnect()
    this.windFilter?.disconnect()
    this.ambienceGain?.disconnect()
    this.masterGain?.disconnect()
    void this.context?.close().catch(() => undefined)

    this.windSource = null
    this.windFilter = null
    this.ambienceGain = null
    this.masterGain = null
    this.context = null
    this.unlocked = false
  }

  private ensureContext(): AudioContext | null {
    if (this.context) return this.context
    const Factory = getAudioContextFactory()
    const context = new Factory()
    const masterGain = context.createGain()
    const ambienceGain = context.createGain()
    const windFilter = context.createBiquadFilter()
    masterGain.gain.value = 0.58
    ambienceGain.gain.value = 0
    windFilter.type = 'lowpass'
    windFilter.frequency.value = 900
    ambienceGain.connect(masterGain)
    masterGain.connect(context.destination)
    this.context = context
    this.masterGain = masterGain
    this.ambienceGain = ambienceGain
    this.windFilter = windFilter
    return context
  }

  private startAmbience(): void {
    if (!this.unlocked || this.windSource) return
    const context = this.context
    if (!context || !this.ambienceGain || !this.windFilter) return
    const buffer = context.createBuffer(
      1,
      context.sampleRate * 2,
      context.sampleRate,
    )
    const channel = buffer.getChannelData(0)
    let last = 0
    for (let index = 0; index < channel.length; index += 1) {
      last = last * 0.985 + (Math.random() * 2 - 1) * 0.015
      channel[index] = last
    }
    const source = context.createBufferSource()
    source.buffer = buffer
    source.loop = true
    source.connect(this.windFilter)
    this.windFilter.connect(this.ambienceGain)
    source.start()
    this.windSource = source
  }

  private playTone(options: ToneOptions): void {
    if (this.muted) return
    const context = this.ensureContext()
    if (!context || !this.masterGain) return
    void context.resume()
    const now = context.currentTime
    const duration = Math.max(0.03, options.duration)
    const attack = options.attack ?? 0.012
    const release = options.release ?? duration * 0.45
    const oscillator = context.createOscillator()
    const gain = context.createGain()
    oscillator.type = options.type ?? 'sine'
    oscillator.frequency.setValueAtTime(options.frequency, now)
    if (options.endFrequency) {
      oscillator.frequency.exponentialRampToValueAtTime(
        Math.max(1, options.endFrequency),
        now + duration,
      )
    }
    gain.gain.setValueAtTime(0.0001, now)
    gain.gain.exponentialRampToValueAtTime(options.gain ?? 0.04, now + attack)
    gain.gain.exponentialRampToValueAtTime(0.0001, now + duration + release)
    oscillator.connect(gain)
    gain.connect(this.masterGain)
    oscillator.start(now)
    oscillator.stop(now + duration + release + 0.04)
  }

  private playNoise(
    duration: number,
    gainValue: number,
    frequency: number,
    filterType: BiquadFilterType,
  ): void {
    if (this.muted) return
    const context = this.ensureContext()
    if (!context || !this.masterGain) return
    void context.resume()
    const now = context.currentTime
    const length = Math.max(1, Math.floor(context.sampleRate * duration))
    const buffer = context.createBuffer(1, length, context.sampleRate)
    const channel = buffer.getChannelData(0)
    for (let index = 0; index < length; index += 1) {
      channel[index] = (Math.random() * 2 - 1) * (1 - index / length)
    }
    const source = context.createBufferSource()
    const gain = context.createGain()
    const filter = context.createBiquadFilter()
    filter.type = filterType
    filter.frequency.value = frequency
    gain.gain.setValueAtTime(gainValue, now)
    gain.gain.exponentialRampToValueAtTime(0.0001, now + duration)
    source.buffer = buffer
    source.connect(filter)
    filter.connect(gain)
    gain.connect(this.masterGain)
    source.start(now)
    source.stop(now + duration + 0.03)
  }
}
