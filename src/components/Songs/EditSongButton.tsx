import {
  ActionIcon,
  Modal,
  type ActionIconProps,
  LoadingOverlay,
  Select,
  TextInput,
  Group,
  Button,
} from "@mantine/core";
import { Form, useForm } from "@mantine/form";
import { useDisclosure } from "@mantine/hooks";
import { IconEdit } from "@tabler/icons-react";
import { useEffect } from "react";
import { useNotify } from "~/utils/Notifications";
import { api } from "~/utils/api";

interface EditSongProps extends ActionIconProps {
  songId: string;
}

interface FormValues {
  countryId: string;
  title: string;
  artist: string;
  previewURL?: string;
  youtubeURL: string;
}

export default function EditSongButton({ songId, ...props }: EditSongProps) {
  const [opened, { open, close }] = useDisclosure(false);

  const notify = useNotify();
  const ctx = api.useContext();
  const song = api.songs.get.useQuery({ id: songId }, { enabled: opened });
  const countries = api.countries.getAll.useQuery(undefined, {
    enabled: opened,
  });

  const mutation = api.songs.update.useMutation({
    onError: notify.onError,
    onSuccess: async () => {
      close();
      notify.songs.songSaved("updated");
      await ctx.songs.getAll.invalidate();
      await ctx.songs.getForYearItem.invalidate();
      await ctx.songs.getForRankedYearGroup.invalidate();
      form.reset();
      mutation.reset();
    },
  });

  const form = useForm<FormValues>({
    initialValues: {
      countryId: "",
      title: "",
      artist: "",
      youtubeURL: "",
      previewURL: undefined,
    },
  });

  useEffect(() => {
    if (form.values.countryId == "" && song.data) {
      form.setValues({
        countryId: song.data?.countryId ?? "",
        title: song.data?.title ?? "",
        artist: song.data?.artist ?? "",
        youtubeURL: song.data?.youtubeURL ?? "",
        previewURL: song.data?.previewURL ?? undefined,
      });
    }
  }, [song, form]);

  const onSubmit = (v: FormValues) => {
    mutation.mutate({ id: songId, ...v });
  };

  return (
    <>
      <ActionIcon color="blue" onClick={open} {...props}>
        <IconEdit />
      </ActionIcon>

      <Modal opened={opened} onClose={close} title="Edit song">
        <LoadingOverlay
          visible={mutation.isLoading || mutation.isSuccess || song.isLoading}
        />

        <Form form={form} onSubmit={onSubmit}>
          {countries.data && (
            <Select
              label="Country"
              withAsterisk
              data={countries.data?.map((c) => ({
                value: c.id,
                label: c.fullname,
              }))}
              searchable
              {...form.getInputProps("countryId")}
            />
          )}

          <TextInput
            label="Song title"
            withAsterisk
            {...form.getInputProps("title")}
          />
          <TextInput
            label="Song artist"
            withAsterisk
            {...form.getInputProps("artist")}
          />
          <TextInput
            label="YouTube URL"
            withAsterisk
            {...form.getInputProps("youtubeURL")}
          />

          <Group mt="md" position="right">
            <Button type="submit">Save</Button>
          </Group>
        </Form>
      </Modal>
    </>
  );
}
