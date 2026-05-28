export type GameOutcome = 'clear' | 'caught'

export type RunnerGameEvent =
  | {
      type: 'ready'
    }
  | {
      type: 'intro'
      caption: string
      index: number
      total: number
    }
  | {
      type: 'running'
      distance: number
      hp: number
      shield: number
      stones: number
      pressure: number
      realm: string
      muted: boolean
    }
  | {
      type: 'result'
      outcome: GameOutcome
      distance: number
      hp: number
      stones: number
      realm: string
      title: string
      cause: string
    }

export type RunnerGameCallbacks = {
  onEvent?: (event: RunnerGameEvent) => void
}
