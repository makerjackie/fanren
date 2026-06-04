import { createFileRoute } from '@tanstack/react-router'

import { HomeSectionRedirect } from '../components/HomeSectionRedirect'

export const Route = createFileRoute('/relationships')({
  component: RelationshipsRedirect,
})

function RelationshipsRedirect() {
  return <HomeSectionRedirect sectionId="fanren-index" label="看人物索引" />
}
