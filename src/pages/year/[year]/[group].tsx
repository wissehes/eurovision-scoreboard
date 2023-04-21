import {
  ActionIcon,
  Box,
  Group,
  Paper,
  Text,
  Title,
  createStyles,
  rem,
} from "@mantine/core";
import { useRouter } from "next/router";
import { useEffect, useMemo, useState } from "react";
import LinkBreadcrumbs, { type Link } from "~/components/LinkBreadcrumbs";
import StandardLayout from "~/layouts/StandardLayout";
import { api } from "~/utils/api";

import {
  DragDropContext,
  Draggable,
  Droppable,
  type OnDragEndResponder,
} from "react-beautiful-dnd";
import { type Country, SongItem } from "@prisma/client";
import { IconBrandYoutube } from "@tabler/icons-react";
import FlagImage from "~/components/Countries/FlagImage";
import PreviewPlayer from "~/components/Songs/PreviewPlayer";
import type { GetServerSideProps, InferGetServerSidePropsType } from "next";
import { getServerAuthSession } from "~/server/auth";
import {
  type RankingData,
  getUserRanking,
} from "~/utils/ranking/getUserRanking";

type Song = SongItem & {
  country: Country;
};

type Items = Song[];

export const getServerSideProps: GetServerSideProps<{
  data: RankingData;
}> = async (ctx) => {
  const session = await getServerAuthSession(ctx);
  if (!session)
    return { redirect: { destination: "/api/auth/signin", permanent: false } };

  const year = ctx.params?.year;
  const yearNumber = Number(year);
  const group = ctx.params?.group;

  if (
    !year ||
    Array.isArray(year) ||
    Number.isNaN(yearNumber) ||
    !group ||
    Array.isArray(group)
  )
    return { notFound: true };

  try {
    const data = await getUserRanking({
      userId: session.user.id,
      groupId: group,
      year: yearNumber,
    });

    return { props: { session, data: data } };
  } catch {
    return { notFound: true };
  }
};

export default function RankingPage({
  data: initialData,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  const router = useRouter();

  const year = Number(router.query.year as string | undefined);
  const groupId = router.query.group as string | undefined;

  const item = api.songs.getForRankedYearGroup.useQuery(
    {
      year,
      id: groupId as string,
    },
    { enabled: !Number.isNaN(year), initialData }
  );

  const update = api.songs.saveRanking.useMutation();

  const [localItems, setLocalItems] = useState<Items | null>(null);

  useEffect(() => {
    if (!item.data) return;
    if (item.data.myRanking?.rankedSongs.length) {
      const ranked = item.data.myRanking.rankedSongs.map((a) => a.song);
      setLocalItems([...ranked, ...item.data.unrankedSongs]);
    } else {
      setLocalItems(item.data.unrankedSongs);
    }
  }, [item.data]);

  const breadcrumbs = useMemo(() => {
    const links: Link[] = [
      { label: "Home", href: "/" },
      { label: `${year}`, href: `/year/${year}` },
    ];

    if (item.data) {
      links.push({
        label: item.data.name,
        href: `/year/${item.data.year}/${item.data.id}`,
      });
    }

    return <LinkBreadcrumbs my="md" links={links} />;
  }, [item.data, year]);

  const onDragEnd: OnDragEndResponder = (result) => {
    if (!result.destination || result.source.index == result.destination.index)
      return;
    if (!localItems) return;

    const newItems = [...localItems];
    const [removed] = newItems.splice(result.source.index, 1);
    if (!removed) return;
    newItems.splice(result.destination.index, 0, removed);
    setLocalItems(newItems);

    if (!groupId) return;
    update.mutate({
      year,
      id: groupId,
      items: newItems.map((a, i) => ({ id: a.id, rank: i + 1 })),
    });
  };

  return (
    <StandardLayout title={`${item.data.name} - ${item.data.year}`}>
      {breadcrumbs}

      <Title mb="md">
        {year}: {item.data?.name}
      </Title>

      <DragDropContext onDragEnd={onDragEnd}>
        {localItems && (
          <Droppable droppableId="droppable-ranked">
            {(provided, _snapshot) => (
              <Paper
                {...provided.droppableProps}
                ref={provided.innerRef}
                p="md"
                mb="md"
                shadow="md"
                radius="md"
                withBorder
                style={{ userSelect: "none" }}
              >
                <Title order={4}>Songs</Title>
                <Text mb="md" color="dimmed">
                  Drag to rearrange to your liking.
                </Text>

                {localItems.map((item, index) => (
                  <Draggable key={item.id} draggableId={item.id} index={index}>
                    {(provided, _snapshot) => (
                      <Paper
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                        ref={provided.innerRef}
                        p="xs"
                        mb="md"
                        radius="sm"
                        shadow="md"
                        withBorder
                      >
                        <SongItem song={item} index={index} />
                      </Paper>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </Paper>
            )}
          </Droppable>
        )}
      </DragDropContext>
    </StandardLayout>
  );
}

interface SongItemProps {
  song: Song;
  index: number;
}

const useStyles = createStyles((theme) => ({
  root: {
    display: "flex",
    alignItems: "center",
  },

  rank: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    paddingRight: "1rem",
    paddingLeft: "1rem",

    width: "2.5rem",
  },

  icon: {
    marginLeft: "auto",
    marginRight: "1.5rem",
    [theme.fn.smallerThan("xs")]: {
      marginRight: "0.5rem",
      flexDirection: "column",
    },
  },

  flag: {
    maxWidth: rem(45),
    marginRight: rem(25),
    [theme.fn.smallerThan("xs")]: {
      marginRight: rem(10),
    },
  },
}));

function SongItem({ song, index }: SongItemProps) {
  const { classes } = useStyles();

  return (
    <Box className={classes.root}>
      <>
        <Box className={classes.rank}>
          <Text size="xl" weight="bold">
            {index + 1}
          </Text>
        </Box>

        <FlagImage code={song.country.isoCode} className={classes.flag} />
        <Box>
          <Text size="lg" weight="bold">
            {song.title}
          </Text>
          <Text size="md">{song.artist}</Text>
        </Box>

        <Group className={classes.icon} position="right">
          <PreviewPlayer
            previewURL={song.previewURL ?? undefined}
            color="pink"
            size="md"
          />

          <ActionIcon
            color="red"
            size="md"
            component={"a"}
            href={song.youtubeURL}
            target="_blank"
            title={`Watch ${song.title} on YouTube`}
          >
            <IconBrandYoutube />
          </ActionIcon>
        </Group>
      </>
    </Box>
  );
}
