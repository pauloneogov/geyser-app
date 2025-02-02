import { Button, ButtonProps } from '@chakra-ui/react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'

import { BoltIcon } from '../../../../../../../components/icons'
import { PathName } from '../../../../../../../constants'
import { isActive } from '../../../../../../../utils'
import { MobileViews, useProjectContext } from '../../../../../context'

export const ContributeButton = (props: ButtonProps) => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { project, setMobileView } = useProjectContext()

  if (!project) {
    return null
  }

  const isFundingDisabled = !isActive(project.status)

  const isInProjectPage = location.pathname.includes(PathName.project) && project.rewards.length > 0

  return (
    <Button
      variant="primary"
      leftIcon={<BoltIcon />}
      onClick={() => {
        setMobileView(MobileViews.funding)
        if (isInProjectPage) {
          navigate(PathName.projectRewards)
        }
      }}
      isDisabled={isFundingDisabled}
      {...props}
    >
      {t('Contribute')}
    </Button>
  )
}
