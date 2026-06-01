import { createFileRoute } from '@tanstack/react-router'

import { HanpaopaoPage } from '../components/hanpaopao/HanpaopaoPage'

export const Route = createFileRoute('/hanpaopao')({
  component: HanpaopaoPage,
})
