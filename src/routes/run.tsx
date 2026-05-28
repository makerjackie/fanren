import { createFileRoute } from '@tanstack/react-router'

import { HanRunnerPage } from '../components/han-runner/HanRunnerPage'

export const Route = createFileRoute('/run')({ component: HanRunnerPage })
