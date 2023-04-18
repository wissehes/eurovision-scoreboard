import { api } from "~/utils/api";
import { useMemo } from "react";
import { useDisclosure } from "@mantine/hooks";
import {
  Button,
  Group,
  LoadingOverlay,
  Modal,
  Select,
  type SelectItem,
  TextInput,
} from "@mantine/core";
import { Form, useForm } from "@mantine/form";
import { useNotify } from "~/utils/Notifications";

interface AddSongDialogProps {
  year: number;
  id: string;
}

interface FormValues {
  country: string;
  artist: string;
  title: string;
  youtube: string;
}

const initialValues: FormValues = {
  country: "",
  artist: "",
  title: "",
  youtube: "",
};

const baseValidation = (v: string) =>
  v.trim().length == 0 ? "This can't be empty." : null;

export default function AddSongModal(props: AddSongDialogProps) {
  const countries = api.countries.getAll.useQuery();
  const context = api.useContext();

  const [opened, { open, close }] = useDisclosure(false);

  const { onError: errorNotification } = useNotify();

  const form = useForm({
    initialValues,
    validate: {
      artist: baseValidation,
      title: baseValidation,
      country: baseValidation,
      youtube: baseValidation,
    },
  });

  const mutation = api.songs.addToYearItem.useMutation({
    onSuccess: async () => {
      await context.songs.getForYearItem.invalidate();
      close();
      form.reset();
    },
    onError: errorNotification,
  });

  const mappedCountries = useMemo<SelectItem[]>(
    () =>
      countries.data?.map((c) => ({
        value: c.id,
        label: c.fullname,
      })) ?? [],
    [countries]
  );

  const onSubmit = (values: FormValues) => {
    form.validate();
    if (!form.isValid) return;
    mutation.mutate({
      year: props.year,
      itemId: props.id,
      ...values,
    });
  };

  return (
    <>
      <Button onClick={open}>Add song</Button>

      <Modal opened={opened} onClose={close} title="Authentication">
        <LoadingOverlay visible={mutation.isLoading || mutation.isSuccess} />
        <Form form={form} onSubmit={onSubmit}>
          <Select
            label="Country"
            withAsterisk
            data={mappedCountries}
            {...form.getInputProps("country")}
          />

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
            {...form.getInputProps("youtube")}
          />

          <Group mt="md" position="right">
            <Button type="submit">Add</Button>
          </Group>
        </Form>
      </Modal>
    </>
  );
}
