import { createFileRoute, redirect } from '@tanstack/react-router'

import { HomeSectionRedirect } from '../components/HomeSectionRedirect'

export const Route = createFileRoute('/relationships')({
  beforeLoad: () => {
    throw redirect({ to: '/', hash: 'fanren-index', replace: true })
  },
  component: RelationshipsRedirect,
})

function RelationshipsRedirect() {
  return <HomeSectionRedirect sectionId="fanren-index" label="看人物索引" />
}
