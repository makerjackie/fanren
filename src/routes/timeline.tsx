import { createFileRoute, redirect } from '@tanstack/react-router'

import { HomeSectionRedirect } from '../components/HomeSectionRedirect'

export const Route = createFileRoute('/timeline')({
  beforeLoad: () => {
    throw redirect({ to: '/', hash: 'hanli-timeline', replace: true })
  },
  component: TimelineRedirect,
})

function TimelineRedirect() {
  return <HomeSectionRedirect sectionId="hanli-timeline" label="回到修仙长卷" />
}
