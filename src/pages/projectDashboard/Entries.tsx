import { useMutation, useQuery } from '@apollo/client';
import {
  GridItem,
  HStack,
  Text,
  useDisclosure,
  VStack,
} from '@chakra-ui/react';
import React, { useEffect, useState } from 'react';
import { BiPlus } from 'react-icons/bi';
import { createUseStyles } from 'react-jss';
import { useHistory } from 'react-router';
import {
  DeleteConfirmModal,
  ProjectEntryCard,
  ProjectSectionBar,
} from '../../components/molecules';
import { ButtonComponent, SatoshiAmount } from '../../components/ui';
import { colors } from '../../constants';
import { fonts } from '../../constants/fonts';
import { MUTATION_DELETE_ENTRY } from '../../graphql/mutations';
import { numberWithCommas, useNotification } from '../../utils';
import {
  Entry,
  Project,
  UniqueProjectQueryInput,
} from '../../types/generated/graphql';
import { QUERY_PROJECT_TOTAL_VISITORS } from '../../graphql';

const useStyles = createUseStyles({
  statBox: {
    padding: '22px',
    backgroundColor: colors.primary100,
    borderRadius: '4px',
  },
  numberText: {
    fontFamily: fonts.mono,
    fontSize: '28px',
    color: colors.neutral900,
  },
  labelText: {
    fontSize: '16px',
    color: colors.neutral600,
  },
});

type ResponseData = {
  project: Project;
};

type QueryVariables = {
  where: UniqueProjectQueryInput;
};

export const Entries = ({ project }: { project: Project }) => {
  const classes = useStyles();
  const history = useHistory();
  const { toast } = useNotification();

  const [liveEntries, setLiveEntries] = useState<Entry[]>([]);
  const [draftEntries, setDraftEntries] = useState<Entry[]>([]);

  const { loading, data } = useQuery<ResponseData, QueryVariables>(
    QUERY_PROJECT_TOTAL_VISITORS,
    {
      variables: { where: { id: project.id } },
      onCompleted: () => {
        if (project && project.entries) {
          const live = project?.entries?.filter(
            (entry) => (entry as Entry).published,
          );
          const draft = project?.entries?.filter(
            (entry) => !(entry as Entry).published,
          );
          setLiveEntries(live as Entry[]);
          setDraftEntries(draft as Entry[]);
        }
      },
    },
  );

  const fundersCount = project.funders?.length || 0;
  const visitorsCount = data?.project?.statistics?.totalVisitors || 0;
  const fundersToVisitorsRatio =
    visitorsCount > 0 ? fundersCount / visitorsCount : 1;
  const fundersToVisitorsPerc = `${fundersToVisitorsRatio / 100} %`;

  const {
    isOpen: isDeleteEntryOpen,
    onClose: closeDeleteEntry,
    onOpen: openDeleteEntry,
  } = useDisclosure();

  const [deleteEntry] = useMutation(MUTATION_DELETE_ENTRY);

  const [selectedEntry, setSelectedEntry] = useState<Entry>();

  const handleCreateEntry = () => {
    history.push(`/projects/${project.name}/entry`);
  };

  const triggerDeleteEntry = (entry: Entry) => {
    setSelectedEntry(entry);
    openDeleteEntry();
  };

  const handleRemoveEntry = async () => {
    if (!selectedEntry || !selectedEntry.id) {
      return;
    }

    try {
      await deleteEntry({ variables: { deleteEntryId: selectedEntry.id } });

      if (selectedEntry.published) {
        const newLive = liveEntries.filter(
          (entry) => entry.id !== selectedEntry.id,
        );
        setLiveEntries(newLive);
      } else {
        const newDraft = liveEntries.filter(
          (entry) => entry.id !== selectedEntry.id,
        );
        setDraftEntries(newDraft);
      }

      toast({
        title: 'Successfully removed entry',
        status: 'success',
      });
    } catch (error) {
      toast({
        title: 'Failed to remove entry',
        description: `${error}`,
        status: 'error',
      });
    }

    closeDeleteEntry();
  };

  return (
    <>
      <GridItem colSpan={8} display="flex" justifyContent="center">
        <VStack
          spacing="30px"
          width="100%"
          minWidth="350px"
          marginBottom="40px"
          display="flex"
          flexDirection="column"
          alignItems="center"
        >
          <VStack w="100%" spacing="40px">
            <VStack alignItems="flex-start">
              <Text fontSize="18px" fontWeight={600} color="brand.neutral600">
                All Time Statistics
              </Text>
              <HStack spacing="22px">
                <VStack className={classes.statBox}>
                  <Text className={classes.numberText}>
                    {loading ? 0 : numberWithCommas(visitorsCount)}
                  </Text>
                  <Text className={classes.labelText}>VISITS</Text>
                </VStack>
                <VStack className={classes.statBox}>
                  <SatoshiAmount
                    fontSize="28px"
                    color="brand.neutral900"
                    fontFamily={fonts.mono}
                  >
                    {loading ? 0 : project.balance}
                  </SatoshiAmount>
                  <Text className={classes.labelText}>FUNDED</Text>
                </VStack>
                <VStack className={classes.statBox}>
                  <Text className={classes.numberText}>
                    {loading ? '0 %' : fundersToVisitorsPerc}
                  </Text>
                  <Text className={classes.labelText}>FUNDERS/VISITORS</Text>
                </VStack>
              </HStack>
            </VStack>
            <VStack w="100%" spacing="30px">
              <ProjectSectionBar
                name="Live"
                number={liveEntries && liveEntries.length}
              />
              <VStack w="100%">
                {liveEntries?.map((entry) => {
                  const entryWithProject = { ...entry, project };

                  return (
                    <ProjectEntryCard
                      key={entry.id}
                      entry={entryWithProject}
                      onEdit={() =>
                        history.push(
                          `/projects/${project.name}/entry/${entry.id}`,
                        )
                      }
                      onDelete={() => triggerDeleteEntry(entry)}
                    />
                  );
                })}
              </VStack>
              <ButtonComponent isFullWidth onClick={handleCreateEntry}>
                <BiPlus style={{ marginRight: '10px' }} />
                Create a new Entry
              </ButtonComponent>
            </VStack>
            <VStack w="100%">
              <ProjectSectionBar
                name="Drafts"
                number={draftEntries && draftEntries.length}
              />
              <VStack>
                {draftEntries?.map((entry) => {
                  const entryWithProject = { ...entry, project };

                  return (
                    <ProjectEntryCard
                      key={entry.id}
                      entry={entryWithProject}
                      onEdit={() =>
                        history.push(
                          `/projects/${project.name}/entry/${entry.id}`,
                        )
                      }
                      onDelete={() => triggerDeleteEntry(entry)}
                    />
                  );
                })}
              </VStack>
            </VStack>
          </VStack>
        </VStack>
      </GridItem>
      <GridItem colSpan={5} display="flex" justifyContent="center">
        <VStack
          justifyContent="center"
          alignItems="flex-start"
          maxWidth="370px"
          spacing="10px"
        ></VStack>
      </GridItem>
      <DeleteConfirmModal
        isOpen={isDeleteEntryOpen}
        onClose={closeDeleteEntry}
        title={`Delete reward ${selectedEntry?.title}`}
        description={'Are you sure you want to remove the entry'}
        confirm={handleRemoveEntry}
      />
    </>
  );
};