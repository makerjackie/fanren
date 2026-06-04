import { createFileRoute } from '@tanstack/react-router'

import { HomeSectionRedirect } from '../components/HomeSectionRedirect'

export const Route = createFileRoute('/timeline')({
  component: TimelineRedirect,
})

function TimelineRedirect() {
  return <HomeSectionRedirect sectionId="hanli-timeline" label="回到修仙长卷" />
}
