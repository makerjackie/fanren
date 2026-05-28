type AudioMode = 'intro' | 'run' | 'clear' | 'danger'

export class AudioDirector {
  private context: AudioContext | null = null
  private master: GainNode | null = null
  private mode: AudioMode | null = null
  private timer: number | null = null
  private muted = false
  private beat = 0

  get isMuted() {
    return this.muted
  }

  async unlock() {
    if (this.context) {
      if (this.context.state === 'suspended') await this.context.resume()
      return
    }

    this.context = new window.AudioContext()
    this.master = this.context.createGain()
    this.master.gain.value = this.muted ? 0 : 0.2
    this.master.connect(this.context.destination)
  }

  setMuted(muted: boolean) {
    this.muted = muted
    if (!this.master || !this.context) return
    this.master.gain.setTargetAtTime(
      muted ? 0 : 0.2,
      this.context.currentTime,
      0.04,
    )
  }

  toggleMuted() {
    this.setMuted(!this.muted)
    return this.muted
  }

  async play(mode: AudioMode) {
    await this.unlock()
    if (this.mode === mode) return
    this.stopLoop()
    this.mode = mode
    this.beat = 0
    this.timer = window.setInterval(
      () => this.tick(),
      mode === 'intro' ? 520 : 310,
    )
    this.tick()
  }

  stop() {
    this.stopLoop()
    this.mode = null
  }

  dispose() {
    this.stop()
    if (this.context) void this.context.close()
    this.context = null
    this.master = null
  }

  pickup() {
    this.pluck(880, 0.06, 0.18, 'triangle')
    window.setTimeout(() => this.pluck(1320, 0.05, 0.14, 'triangle'), 70)
  }

  jump() {
    this.pluck(440, 0.05, 0.11, 'sine')
  }

  attack() {
    this.pluck(760, 0.04, 0.16, 'sawtooth')
  }

  hit() {
    this.pluck(120, 0.09, 0.22, 'square')
  }

  clear() {
    this.pluck(660, 0.1, 0.2, 'triangle')
    window.setTimeout(() => this.pluck(880, 0.1, 0.18, 'triangle'), 120)
    window.setTimeout(() => this.pluck(1320, 0.16, 0.16, 'triangle'), 240)
  }

  private stopLoop() {
    if (this.timer !== null) window.clearInterval(this.timer)
    this.timer = null
  }

  private tick() {
    if (!this.context || !this.master || this.muted || !this.mode) return

    const scale =
      this.mode === 'intro'
        ? [196, 247, 294, 392, 330, 294]
        : this.mode === 'clear'
          ? [392, 494, 587, 784]
          : this.mode === 'danger'
            ? [110, 147, 165, 196]
            : [220, 294, 330, 392, 440, 392]
    const note = scale[this.beat % scale.length]
    const bass = this.mode === 'danger' ? 55 : this.mode === 'intro' ? 98 : 110

    this.pluck(note, 0.04, this.mode === 'intro' ? 0.12 : 0.08, 'triangle')
    if (this.beat % 2 === 0) this.pluck(bass, 0.08, 0.09, 'sine')
    this.beat += 1
  }

  private pluck(
    frequency: number,
    duration: number,
    volume: number,
    type: OscillatorType,
  ) {
    if (!this.context || !this.master || this.muted) return

    const now = this.context.currentTime
    const oscillator = this.context.createOscillator()
    const gain = this.context.createGain()
    oscillator.type = type
    oscillator.frequency.value = frequency
    gain.gain.setValueAtTime(0.0001, now)
    gain.gain.exponentialRampToValueAtTime(volume, now + 0.012)
    gain.gain.exponentialRampToValueAtTime(0.0001, now + duration)
    oscillator.connect(gain)
    gain.connect(this.master)
    oscillator.start(now)
    oscillator.stop(now + duration + 0.02)
  }
}
