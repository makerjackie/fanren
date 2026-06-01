import { getChasePressureDelta } from '../core/gameRules'

export default class ChasePressure {
  readonly max = 100

  value = 40

  reset() {
    this.value = 40
  }

  update(delta: number, qi: number, speedRatio = 0) {
    this.add(getChasePressureDelta(delta, qi, speedRatio))
  }

  add(amount: number) {
    this.value = Math.min(this.max, Math.max(0, this.value + amount))
  }

  reduce(amount: number) {
    this.add(-amount)
  }

  get isCaught() {
    return this.value >= this.max
  }
}
