import {
  Button,
  Checkbox,
  LoadingOverlay,
  Modal,
  Switch,
  Text,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { IconPlus } from "@tabler/icons-react";
import { useEffect, useState } from "react";
import { useNotify } from "~/utils/Notifications";
import { api } from "~/utils/api";
import delay from "~/utils/delay";
import { getFlagEmoji } from "~/utils/getFlagEmoji";

export default function AddExistingSongModal({
  year,
  groupId,
}: {
  year: number;
  groupId: string;
}) {
  const [opened, { open, close }] = useDisclosure(false);
  const notify = useNotify();
  const context = api.useContext();

  const [selectedSongs, setSelectedSongs] = useState<string[]>([]);
  const [shouldFilter, setFilter] = useState(false);
  const songs = api.songs.getForYear.useQuery(
    { year, filter: shouldFilter },
    { enabled: opened }
  );

  useEffect(() => {
    if (!songs.data) return;
    const songsInGroup = songs.data.filter((s) =>
      s.groups.find((s) => s.id == groupId)
    );
    setSelectedSongs((v) => (v.length ? v : songsInGroup.map((a) => a.id)));
  }, [songs.data, groupId]);

  const mutatation = api.group.setSongs.useMutation({
    onError: notify.onError,
    onSuccess: async () => {
      close();
      await context.songs.getForYearItem.invalidate({ year, id: groupId });
      await delay(250);
      setSelectedSongs([]);
      mutatation.reset();
    },
  });

  const update = () => {
    mutatation.mutate({
      groupId,
      songIds: selectedSongs,
    });
  };

  return (
    <>
      <Button onClick={open} leftIcon={<IconPlus size="1rem" />}>
        Add existing
      </Button>
      <Modal opened={opened} onClose={close} title="Add existing song">
        <LoadingOverlay
          visible={mutatation.isLoading || mutatation.isSuccess}
        />
        {/* <Text>Choose songs to add.</Text> */}

        <Switch
          label="This year only"
          checked={shouldFilter}
          onChange={(e) => setFilter(e.currentTarget.checked)}
          mb="md"
        />

        <Checkbox.Group value={selectedSongs} onChange={setSelectedSongs}>
          {songs.data?.map((s) => (
            <Checkbox
              key={s.id}
              value={s.id}
              label={`${getFlagEmoji(s.country.isoCode)} ${s.artist} - ${
                s.title
              }`}
              mb="xs"
            />
          ))}
        </Checkbox.Group>

        <Button onClick={update}>Save</Button>
      </Modal>
    </>
  );
}
