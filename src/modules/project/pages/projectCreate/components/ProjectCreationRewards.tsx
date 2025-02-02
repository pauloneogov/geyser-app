import { useMutation } from '@apollo/client'
import { SimpleGrid, useBreakpoint } from '@chakra-ui/react'
import { forwardRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'

import { CardLayout } from '../../../../../components/layouts'
import { DeleteConfirmModal } from '../../../../../components/molecules'
import { getPath, ID } from '../../../../../constants'
import { MUTATION_DELETE_PROJECT_REWARD } from '../../../../../graphql/mutations'
import { useModal } from '../../../../../hooks/useModal'
import { ProjectRewardForCreateUpdateFragment as Reward } from '../../../../../types'
import { Project, ProjectRewardForCreateUpdateFragment } from '../../../../../types/generated/graphql'
import { isActive, useNotification } from '../../../../../utils'
import { truthyFilter } from '../../../../../utils/array'
import { useProjectContext } from '../../../context'
import { RewardCard } from '../../projectView/views/projectMainBody/components/RewardCard'

export const ProjectCreationRewards = forwardRef<HTMLDivElement>((_, ref) => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const breakpoint = useBreakpoint({ ssr: false })
  const largeView = ['xl', '2xl'].includes(breakpoint)
  const { toast } = useNotification()

  const {
    project,
    fundForm: { state: fundFormState },
    updateProject,
    refetch,
  } = useProjectContext()

  const [selectedReward, setSelectedReward] = useState<ProjectRewardForCreateUpdateFragment>()
  const { isOpen: isRewardDeleteOpen, onClose: onRewardDeleteClose, onOpen: openRewardDelete } = useModal()

  const [deleteRewardMutation] = useMutation<any, { input: { projectRewardId: Number } }>(
    MUTATION_DELETE_PROJECT_REWARD,
    {
      onCompleted() {
        const newRewards = project?.rewards?.filter((reward) => reward?.id !== selectedReward?.id)
        updateProject({ rewards: newRewards || [] } as Project)
        handleClose()
        refetch()
        toast({
          title: 'Successfully removed!',
          description: `${t('Reward')} ${selectedReward?.name} ${t('was successfully removed')}`,
          status: 'success',
        })
      },
      onError(error) {
        handleClose()
        toast({
          title: 'Failed to remove reward',
          description: `${error}`,
          status: 'error',
        })
      },
    },
  )

  if (!project || !isActive || !project.rewards || project.rewards.length === 0) {
    return null
  }

  const activeProjectRewards = project.rewards.filter((reward) => reward.isHidden === false)

  const handleClose = () => {
    setSelectedReward(undefined)
    onRewardDeleteClose()
  }

  const triggerRewardRemoval = (id?: number) => {
    const currentReward = project.rewards?.find((reward) => reward?.id === id)
    if (!currentReward) {
      return
    }

    setSelectedReward(currentReward)
    openRewardDelete()
  }

  const handleRemoveReward = async () => {
    if (!selectedReward?.id) {
      return
    }

    deleteRewardMutation({
      variables: {
        input: {
          projectRewardId: selectedReward.id,
        },
      },
    })
  }

  const handleOnRewardEdit = (reward: Reward) => {
    navigate(getPath('launchProjectRewardsEdit', project.id, reward.id))
  }

  const handleOnRewardDelete = (reward: Reward) => {
    triggerRewardRemoval(reward.id)
  }

  const renderRewards = () => {
    if (activeProjectRewards.length > 0) {
      return activeProjectRewards.filter(truthyFilter).map((reward) => {
        const count = (fundFormState.rewardsByIDAndCount && fundFormState.rewardsByIDAndCount[`${reward.id}`]) || 0
        return (
          <RewardCard
            key={reward.id}
            width="100%"
            reward={reward}
            count={count}
            handleEdit={() => handleOnRewardEdit(reward)}
            handleRemove={() => handleOnRewardDelete(reward)}
            isLaunch={true}
          />
        )
      })
    }
  }

  if (!project.rewards.length) {
    return null
  }

  return (
    <>
      <CardLayout
        ref={ref}
        id={ID.project.rewards.container}
        width="100%"
        flexDirection="column"
        alignItems="flex-start"
        spacing="25px"
        mobileDense
        border="none"
        p={0}
      >
        <SimpleGrid columns={largeView ? 2 : 1} spacing={'20px'} width={'100%'}>
          {renderRewards()}
        </SimpleGrid>
      </CardLayout>
      <DeleteConfirmModal
        isOpen={isRewardDeleteOpen}
        onClose={handleClose}
        title={`${t('Delete reward')}`}
        description={t('Are you sure you want to remove the reward?')}
        confirm={handleRemoveReward}
      />
    </>
  )
})
