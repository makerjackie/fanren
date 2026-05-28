import { AudioDirector } from './AudioDirector'
import type { RunnerGameCallbacks } from '../types'

export const registryKeys = {
  callbacks: 'runner.callbacks',
  audio: 'runner.audio',
}

export function setCallbacks(
  registry: Phaser.Data.DataManager,
  callbacks: RunnerGameCallbacks,
) {
  registry.set(registryKeys.callbacks, callbacks)
}

export function getCallbacks(registry: Phaser.Data.DataManager) {
  return registry.get(registryKeys.callbacks) as RunnerGameCallbacks | undefined
}

export function getAudio(registry: Phaser.Data.DataManager) {
  let audio = registry.get(registryKeys.audio) as AudioDirector | undefined
  if (!audio) {
    audio = new AudioDirector()
    registry.set(registryKeys.audio, audio)
  }
  return audio
}
