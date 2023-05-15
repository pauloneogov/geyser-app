import { Box, Image } from '@chakra-ui/react'
import { createUseStyles } from 'react-jss'

import { Body1, H1, H3 } from '../../../../components/typography'
import { StatusLabel } from '../../../../components/ui/StatusLabel'
import { Grant } from '../../../../types'
import { getShortAmountLabel, useMobileMode } from '../../../../utils'
import { ContributionsWidget } from '../../components/ContributionsWidget'
import { SectionCard } from '../../components/SectionCard'
import {
  GRANT_STATUS_COUNTDOWN_TITLES,
  GRANT_STATUS_MAP,
} from '../../constants'

const useStyles = createUseStyles({
  imageContainer: {
    width: '100%',
  },
  headerImage: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    borderTopLeftRadius: '6px',
    borderTopRightRadius: '6px',
  },
})

export const GrantSummary = ({ grant }: { grant: Grant }) => {
  const classes = useStyles()
  const isMobile = useMobileMode()

  const votingEndDate = grant.statuses.find(
    (s) => s.status === grant.status,
  )?.endAt

  return (
    <SectionCard>
      {grant.image ? (
        <Box
          className={classes.imageContainer}
          height={isMobile ? '127px' : '291px'}
        >
          <Image
            className={classes.headerImage}
            alt="grant header image"
            src={grant.image}
          />
        </Box>
      ) : null}
      <Box p={5}>
        {isMobile ? null : (
          <Box pb={2}>
            <StatusLabel textTransform="uppercase">
              {GRANT_STATUS_MAP[grant.status]}
            </StatusLabel>
          </Box>
        )}
        <Box
          display="flex"
          flexDir={isMobile ? 'column' : 'row'}
          width="100%"
          pt={2}
          justifyContent="space-between"
        >
          <Box pt={2}>
            <H1>{grant.title}</H1>
          </Box>
        </Box>
        <Box pt={4}>
          <H3 fontSize="18px">{grant.shortDescription}</H3>
          <Body1 fontSize="16px" pt={4}>
            {grant.description}
          </Body1>
          <ContributionsWidget
            sponsors={grant.sponsors}
            endDateSubtitle={GRANT_STATUS_COUNTDOWN_TITLES[grant.status]}
            endDateTimestamp={votingEndDate}
            balance={getShortAmountLabel(grant.balance || 0, true)}
            contributions={getShortAmountLabel(
              grant.applicants.reduce(
                (prev, curr) => prev + (curr?.funding.communityFunding || 0),
                0,
              ) || 0,
              true,
            )}
          />
        </Box>
      </Box>
    </SectionCard>
  )
}