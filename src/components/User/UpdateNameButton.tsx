import {
  Anchor,
  Button,
  FocusTrap,
  Group,
  LoadingOverlay,
  Modal,
  Paper,
  TextInput,
  useMantineTheme,
} from "@mantine/core";
import { Form, useForm } from "@mantine/form";
import { useDisclosure } from "@mantine/hooks";
import { useSession } from "next-auth/react";
import { useEffect } from "react";
import { api } from "~/utils/api";
import delay from "~/utils/delay";

interface UpdateNameProps {
  create?: string;
  update?: string;
}

export default function UpdateNameButton(props: UpdateNameProps) {
  const { data: session } = useSession();
  const [opened, { open, close }] = useDisclosure(false);

  const text = session?.user.name
    ? props.update ?? "Update name"
    : props.create ?? "Set name";

  return (
    <>
      <Anchor onClick={open}>{text}</Anchor>
      <Modal opened={opened} onClose={close} title={text} keepMounted={false}>
        <UpdateNameBody onClose={close} />
      </Modal>
    </>
  );
}

function UpdateNameBody({ onClose }: { onClose: () => void }) {
  const { data: session, update: updateSession } = useSession();
  const theme = useMantineTheme();

  const context = api.useContext();
  const update = api.users.updateName.useMutation({
    onSuccess: async () => {
      onClose();
      await updateSession();
      await context.users.me.invalidate();
      await delay(250);
      update.reset();
      form.reset();
    },
  });
  const onSubmit = (v: { name: string }) => update.mutate(v);

  const form = useForm({
    initialValues: {
      name: "",
    },
    validate: {
      name: (v) => {
        const name = v.trim();
        if (name.length == 0) return "Your name can't be empty!";
        else if (name.length < 3)
          return "Your name must be 3 characters or longer!";
        else if (name.length >= 32)
          return "Your name must not exceed 32 characters!";
        else return null;
      },
    },
  });

  useEffect(() => {
    if (
      form.values.name == "" &&
      !form.isTouched() &&
      session?.user.name &&
      session.user.name !== ""
    ) {
      form.setFieldValue("name", session?.user.name);
    }
  }, [form, session]);

  return (
    <Paper
      p={0}
      shadow={undefined}
      sx={{
        position: "relative",
        backgroundColor:
          theme.colorScheme === "dark" ? theme.colors.dark[7] : theme.white,
      }}
    >
      <Form form={form} onSubmit={onSubmit}>
        <LoadingOverlay visible={update.isLoading || update.isSuccess} />
        <FocusTrap active>
          <TextInput
            label="New name"
            placeholder="What's your new name? XOXO"
            autoComplete="none"
            {...form.getInputProps("name")}
          />
        </FocusTrap>
        <Group position="right" mt="xl">
          <Button type="submit">Update!</Button>
        </Group>
      </Form>
    </Paper>
  );
}
