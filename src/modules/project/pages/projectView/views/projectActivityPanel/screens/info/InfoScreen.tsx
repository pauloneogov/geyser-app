import { VStack } from '@chakra-ui/layout'

import { standardPadding } from '../../../../../../../../styles'
import { useMobileMode } from '../../../../../../../../utils'
import { MobileViews, useProjectContext } from '../../../../../../context'
import { ActivityBrief } from './views/ActivityBrief'
import { InfoScreenFeed } from './views/InfoScreenFeed'
import { InfoScreenRewards } from './views/InfoScreenRewards'

export const InfoScreen = () => {
  const { project, mobileView } = useProjectContext()

  const isMobile = useMobileMode()

  if (!project) {
    return null
  }

  const activeProjectRewards =
    project && project.rewards ? project.rewards.filter((reward) => reward.isHidden === false) : []
  const showFeed =
    (isMobile && (mobileView === MobileViews.leaderboard || mobileView === MobileViews.contributors)) ||
    activeProjectRewards.length === 0

  return (
    <VStack
      py={{ base: '0px', lg: '10px' }}
      spacing={4}
      width="100%"
      height="100%"
      overflowY="hidden"
      position="relative"
    >
      <ActivityBrief px={standardPadding} />

      {showFeed ? <InfoScreenFeed /> : <InfoScreenRewards />}
    </VStack>
  )
}
