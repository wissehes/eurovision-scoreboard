import {
  ActionIcon,
  Box,
  Paper,
  Text,
  Title,
  createStyles,
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
import { IconBrandYoutube, IconGripVertical } from "@tabler/icons-react";
import FlagImage from "~/components/Countries/FlagImage";
import PreviewPlayer from "~/components/Songs/PreviewPlayer";

type Song = SongItem & {
  country: Country;
};

type Items = Song[];

export default function ItemAdminPage() {
  const router = useRouter();

  const year = Number(router.query.year as string | undefined);
  const groupId = router.query.group as string | undefined;

  const item = api.songs.getForRankedYearGroup.useQuery(
    {
      year,
      id: groupId as string,
    },
    { enabled: !Number.isNaN(year) }
  );

  const update = api.songs.saveRanking.useMutation();

  const [localItems, setLocalItems] = useState<Items | null>(null);

  useEffect(() => {
    if (!item.data) return;
    if (item.data.myRanking?.rankedSongs.length) {
      setLocalItems(item.data.myRanking.rankedSongs.map((a) => a.song));
    } else {
      setLocalItems(item.data.unrankedSongs);
    }
  }, [item.data]);

  const breadcrumbs = useMemo(() => {
    const links: Link[] = [
      { label: "Home", href: "/" },
      { label: "All years", href: "/year" },
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
    if (!result.destination) return;
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
    <StandardLayout title="Year item">
      {breadcrumbs}

      <Title mb="md">
        {year}: {item.data?.name}
      </Title>

      <DragDropContext onDragEnd={onDragEnd}>
        {localItems && (
          <Droppable droppableId={`${year}-droppable`}>
            {(provided, _snapshot) => (
              <Paper
                {...provided.droppableProps}
                ref={provided.innerRef}
                p="md"
                shadow="md"
                radius="md"
                withBorder
                style={{ userSelect: "none" }}
              >
                <Title order={5} mb="md">
                  Songs
                </Title>

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

const useStyles = createStyles(() => ({
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

  youtubeIcon: {
    marginLeft: "auto",
    marginRight: "1.5rem",
  },
}));

function SongItem({ song, index }: SongItemProps) {
  const { classes } = useStyles();

  return (
    <Box className={classes.root}>
      <Box className={classes.rank}>
        <Text size="xl" weight="bold">
          {index + 1}
        </Text>
      </Box>

      <FlagImage code={song.country.isoCode} maw={45} mx="sm" />
      <Box>
        <Text size="lg" weight="bold">
          {song.title}
        </Text>
        <Text size="md">{song.artist}</Text>
      </Box>

      <PreviewPlayer
        previewURL={song.previewURL ?? undefined}
        color="pink"
        size="xl"
        className={classes.youtubeIcon}
      />

      <ActionIcon
        color="red"
        size="xl"
        component={"a"}
        href={song.youtubeURL}
        target="_blank"
        title={`Watch ${song.title} on YouTube`}
      >
        <IconBrandYoutube size="2.5rem" />
      </ActionIcon>

      <IconGripVertical size="2.5rem" color="gray" />
    </Box>
  );
}
