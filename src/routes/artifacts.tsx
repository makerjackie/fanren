import { createFileRoute } from '@tanstack/react-router'

import { HomeSectionRedirect } from '../components/HomeSectionRedirect'

export const Route = createFileRoute('/artifacts')({
  component: ArtifactsRedirect,
})

function ArtifactsRedirect() {
  return <HomeSectionRedirect sectionId="fanren-index" label="看法宝索引" />
}
