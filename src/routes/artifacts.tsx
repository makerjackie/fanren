import { createFileRoute, redirect } from '@tanstack/react-router'

import { HomeSectionRedirect } from '../components/HomeSectionRedirect'

export const Route = createFileRoute('/artifacts')({
  beforeLoad: () => {
    throw redirect({ to: '/', hash: 'fanren-index', replace: true })
  },
  component: ArtifactsRedirect,
})

function ArtifactsRedirect() {
  return <HomeSectionRedirect sectionId="fanren-index" label="看法宝索引" />
}
