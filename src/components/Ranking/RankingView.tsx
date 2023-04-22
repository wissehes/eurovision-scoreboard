// Mantine Components
import { Paper, Text, Title } from "@mantine/core";

// Types
import type { Country, SongItem } from "@prisma/client";
import type { RankingData } from "~/utils/ranking/getUserRanking";
import type { OnDragEndResponder } from "react-beautiful-dnd";

// API & Hooks
import { useMemo, useState } from "react";
import { api } from "~/utils/api";

// Other components
import { DragDropContext, Draggable, Droppable } from "react-beautiful-dnd";
import { DraggableSongItem } from "./DraggableSongItem";

interface RankingViewProps {
  year: number;
  groupId: string;
  initialData?: RankingData;
}

type Song = SongItem & {
  country: Country;
};

export default function RankingView({ year, groupId }: RankingViewProps) {
  //   const apiCtx = api.useContext();
  const group = api.songs.getForRankedYearGroup.useQuery({ year, id: groupId });
  const update = api.songs.saveRanking.useMutation();

  const [localSongs, setLocalSongs] = useState<Song[] | null>(null);

  const items = useMemo(() => {
    if (localSongs) {
      return localSongs;
    } else if (group.data?.myRanking?.rankedSongs.length) {
      return group.data.myRanking.rankedSongs.map((a) => a.song);
    } else {
      return group.data?.unrankedSongs;
    }
  }, [group.data, localSongs]);

  const onDragEnd: OnDragEndResponder = (result) => {
    if (!result.destination || result.source.index == result.destination.index)
      return;
    if (!items || !group.data) return;

    const newItems = [...items];
    const [removed] = newItems.splice(result.source.index, 1);
    if (!removed) return;
    newItems.splice(result.destination.index, 0, removed);
    setLocalSongs(newItems);

    if (!groupId) return;
    update.mutate({
      year,
      id: groupId,
      items: newItems.map((a, i) => ({ id: a.id, rank: i + 1 })),
    });
  };

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      {items && (
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
              style={{
                userSelect: "none",
                // No styles on top, so it lines up with the tabs
                borderTop: "none",
                borderTopLeftRadius: 0,
                borderTopRightRadius: 0,
              }}
            >
              <Title order={4}>Songs</Title>
              <Text mb="md" color="dimmed">
                Drag to rearrange to your liking.
              </Text>
              {items.map((item, index) => (
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
                      <DraggableSongItem song={item} index={index} />
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
  );
}
