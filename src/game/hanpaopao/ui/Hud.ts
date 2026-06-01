import type { GameSnapshot } from '../core/types'

const requiredElement = <T extends HTMLElement>(selector: string): T => {
  const element = document.querySelector<T>(selector)
  if (!element) {
    throw new Error(`Missing UI element: ${selector}`)
  }
  return element
}

export default class Hud {
  private hud = requiredElement<HTMLElement>('#hud')

  private hpBar = requiredElement<HTMLElement>('#hp-bar')

  private hpMeter = requiredElement<HTMLElement>('#hp-meter')

  private hpValue = requiredElement<HTMLElement>('#hp-value')

  private qiBar = requiredElement<HTMLElement>('#qi-bar')

  private qiMeter = requiredElement<HTMLElement>('#qi-meter')

  private qiValue = requiredElement<HTMLElement>('#qi-value')

  private chaseBar = requiredElement<HTMLElement>('#chase-bar')

  private chaseMeter = requiredElement<HTMLElement>('#chase-meter')

  private chaseValue = requiredElement<HTMLElement>('#chase-value')

  private distanceValue = requiredElement<HTMLElement>('#distance-value')

  private scoreValue = requiredElement<HTMLElement>('#score-value')

  private dangerRibbon = requiredElement<HTMLElement>('#danger-ribbon')

  private comboBadge = requiredElement<HTMLElement>('#combo-badge')

  private milestoneValue = requiredElement<HTMLElement>('#milestone-value')

  private shieldStatus = requiredElement<HTMLElement>('#shield-status')

  private dashStatus = requiredElement<HTMLElement>('#dash-status')

  private boostStatus = requiredElement<HTMLElement>('#boost-status')

  private spiritCount = requiredElement<HTMLElement>('#spirit-count')

  private elixirCount = requiredElement<HTMLElement>('#elixir-count')

  private talismanCount = requiredElement<HTMLElement>('#talisman-count')

  private energyCount = requiredElement<HTMLElement>('#energy-count')

  private finalDistance = requiredElement<HTMLElement>('#final-distance')

  private finalSpirit = requiredElement<HTMLElement>('#final-spirit')

  private finalScore = requiredElement<HTMLElement>('#final-score')

  private finalNearMiss = requiredElement<HTMLElement>('#final-near-miss')

  private finalReason = requiredElement<HTMLElement>('#final-reason')

  private bestDistance = requiredElement<HTMLElement>('#best-distance')

  private bestScore = requiredElement<HTMLElement>('#best-score')

  private gameOverModal = requiredElement<HTMLElement>('#game-over-modal')

  private pauseModal = requiredElement<HTMLElement>('#pause-modal')

  private resumeButton = requiredElement<HTMLButtonElement>('#resume-button')

  private restartButton = requiredElement<HTMLButtonElement>('#restart-button')

  private toast = requiredElement<HTMLElement>('#toast')

  private dashButton = requiredElement<HTMLButtonElement>('#dash-button')

  private boostButton = requiredElement<HTMLButtonElement>('#boost-button')

  private muteToggle = requiredElement<HTMLButtonElement>('#mute-toggle')

  private motionToggle = requiredElement<HTMLButtonElement>('#motion-toggle')

  private toastTimer = 0

  showHud() {
    this.hud.classList.remove('is-hidden')
  }

  hideHud() {
    this.hud.classList.add('is-hidden')
  }

  showPause() {
    this.pauseModal.hidden = false
    this.resumeButton.focus()
  }

  hidePause() {
    this.pauseModal.hidden = true
  }

  showGameOver(snapshot: GameSnapshot) {
    this.finalScore.textContent = `${Math.floor(snapshot.score)}`
    this.finalDistance.textContent = `${Math.floor(snapshot.distance)} 米`
    this.finalSpirit.textContent = `${snapshot.spiritStones}`
    this.finalNearMiss.textContent = `${snapshot.nearMisses}`
    this.finalReason.textContent = snapshot.gameOverReason
    this.bestScore.textContent = `${Math.floor(snapshot.bestScore)}`
    this.bestDistance.textContent = `${Math.floor(snapshot.bestDistance)} 米`
    this.gameOverModal.hidden = false
    this.restartButton.focus()
  }

  hideGameOver() {
    this.gameOverModal.hidden = true
  }

  update(snapshot: GameSnapshot) {
    const hp = Math.max(0, Math.round(snapshot.hp))
    const qi = Math.max(0, Math.round(snapshot.qi))
    const chase = Math.max(0, Math.min(100, Math.round(snapshot.chasePressure)))

    this.hpBar.style.width = `${hp}%`
    this.hpMeter.setAttribute('aria-valuenow', `${hp}`)
    this.hpValue.textContent = `${hp}`
    this.qiBar.style.width = `${qi}%`
    this.qiMeter.setAttribute('aria-valuenow', `${qi}`)
    this.qiValue.textContent = `${qi}`

    this.chaseBar.style.width = `${chase}%`
    this.chaseMeter.setAttribute('aria-valuenow', `${chase}`)
    if (chase < 55) {
      this.chaseBar.style.background =
        'linear-gradient(90deg, #62e3ff, #36d59a)'
    } else if (chase < 75) {
      this.chaseBar.style.background =
        'linear-gradient(90deg, #f5bd55, #ffcf68)'
    } else {
      this.chaseBar.style.background =
        'linear-gradient(90deg, #ff7a3d, #ef4f6d)'
    }
    this.chaseValue.textContent = `${chase}%`
    this.updatePressureState(chase)

    this.distanceValue.textContent = `${Math.floor(snapshot.distance)} 米`
    this.scoreValue.textContent = `${Math.floor(snapshot.score)}`
    this.spiritCount.textContent = `${snapshot.spiritStones}`
    this.elixirCount.textContent = `${snapshot.elixirs}`
    this.talismanCount.textContent = `${snapshot.talismans}`
    this.energyCount.textContent = `${snapshot.swordEnergy}`
    this.updateCombo(snapshot.combo, snapshot.comboMultiplier)
    this.updateStatus(this.shieldStatus, snapshot.shieldSeconds)
    this.updateStatus(this.dashStatus, snapshot.dashSeconds)
    this.updateStatus(this.boostStatus, snapshot.boostSeconds)
    this.milestoneValue.textContent = `${snapshot.nextMilestone} 米`
    this.dashButton.classList.toggle('is-active', snapshot.dashSeconds > 0)
    this.dashButton.classList.toggle(
      'is-disabled',
      qi < 8 && snapshot.dashSeconds <= 0,
    )
    this.dashButton.disabled = qi < 8 && snapshot.dashSeconds <= 0
    this.dashButton.setAttribute(
      'aria-pressed',
      snapshot.dashSeconds > 0 ? 'true' : 'false',
    )
    this.boostButton.classList.toggle('is-active', snapshot.boostSeconds > 0)
    this.boostButton.classList.toggle(
      'is-disabled',
      qi <= 0 && snapshot.boostSeconds <= 0,
    )
    this.boostButton.disabled = qi <= 0 && snapshot.boostSeconds <= 0
    this.boostButton.setAttribute(
      'aria-pressed',
      snapshot.boostSeconds > 0 ? 'true' : 'false',
    )
    this.updateSettingToggle(
      this.muteToggle,
      snapshot.muted,
      '音效 关',
      '音效 开',
    )
    this.updateSettingToggle(
      this.motionToggle,
      snapshot.reducedMotion,
      '动态 降低',
      '动态 标准',
    )
  }

  announce(message: string) {
    window.clearTimeout(this.toastTimer)
    this.toast.textContent = message
    this.toast.classList.add('is-visible')
    this.toastTimer = window.setTimeout(() => {
      this.toast.classList.remove('is-visible')
    }, 1300)
  }

  private updatePressureState(chase: number) {
    this.hud.classList.toggle('hud--warning', chase >= 65 && chase < 84)
    this.hud.classList.toggle('hud--critical', chase >= 84)

    if (chase >= 88) {
      this.dangerRibbon.textContent = '魔影贴近 · 立刻冲刺或拾取清心丹'
      return
    }

    if (chase >= 72) {
      this.dangerRibbon.textContent = '追杀逼近 · 避开紫色光带'
      return
    }

    if (chase >= 55) {
      this.dangerRibbon.textContent = '魔气抬升 · 留意前方禁制'
      return
    }

    this.dangerRibbon.textContent = '沿灵脉飞行 · 紫色预警代表禁制封路'
  }

  private updateCombo(combo: number, multiplier: number) {
    const visible = combo >= 3 || multiplier > 1
    this.comboBadge.hidden = !visible
    if (!visible) return
    this.comboBadge.textContent = `连击 ${combo} · x${multiplier.toFixed(2)}`
    this.comboBadge.classList.toggle('combo-badge--hot', multiplier >= 1.75)
  }

  private updateStatus(element: HTMLElement, seconds: number) {
    const active = seconds > 0.05
    element.textContent = active ? `${Math.ceil(seconds)} 秒` : '待机'
    element.parentElement?.classList.toggle('is-active', active)
  }

  private updateSettingToggle(
    element: HTMLButtonElement,
    active: boolean,
    activeText: string,
    inactiveText: string,
  ) {
    element.textContent = active ? activeText : inactiveText
    element.setAttribute('aria-pressed', active ? 'true' : 'false')
    element.classList.toggle('is-active', active)
  }
}
