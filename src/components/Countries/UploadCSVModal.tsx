import {
  Button,
  Modal,
  type ButtonProps,
  useMantineTheme,
  Group,
  rem,
  Text,
  TextInput,
  Stack,
  Anchor,
  LoadingOverlay,
} from "@mantine/core";
import { Dropzone, type FileWithPath, MIME_TYPES } from "@mantine/dropzone";
import { Form, useForm } from "@mantine/form";
import { useDisclosure } from "@mantine/hooks";
import { IconFile, IconUpload, IconX } from "@tabler/icons-react";
import { create } from "zustand";
import { useNotify } from "~/utils/Notifications";
import { api } from "~/utils/api";
import delay from "~/utils/delay";

interface UploadCSVModalProps {
  buttonProps?: ButtonProps;
}

interface FormValues {
  delimiter: string;
  idColName: string;
  fullnameColName: string;
}

interface DropState {
  selectedFile: FileWithPath | null;
  setFile: (to: FileWithPath | null) => void;
  reset: () => void;
}

const useDropState = create<DropState>((set) => ({
  selectedFile: null,
  setFile: (v) => set({ selectedFile: v }),
  reset: () => set({ selectedFile: null }),
}));

const initialValues: FormValues = {
  delimiter: ",",
  idColName: "id",
  fullnameColName: "fullname",
};

export default function UploadCSVModal(props: UploadCSVModalProps) {
  const context = api.useContext();
  const [opened, { open, close }] = useDisclosure(false);
  const selectedFile = useDropState((s) => s.selectedFile);
  const resetFile = useDropState((s) => s.reset);
  const notify = useNotify();
  const formState = useForm({
    initialValues,
  });

  const mutation = api.countries.createFromCSV.useMutation({
    onError: notify.onError,
    onSuccess: async () => {
      await context.countries.getAll.invalidate();
      close();
      await delay(250);
      formState.reset();
      resetFile();
      mutation.reset();
    },
  });

  const upload = async (v: FormValues) => {
    if (!selectedFile) return;

    const data = await selectedFile.text();

    mutation.mutate({ csvText: data, ...v });
  };

  return (
    <>
      <Button {...props.buttonProps} onClick={open}>
        Upload CSV
      </Button>

      <Modal opened={opened} onClose={close} title="Upload CSV" size="lg">
        <LoadingOverlay visible={mutation.isLoading || mutation.isSuccess} />

        {!selectedFile && <ViewDropZone />}
        {selectedFile && (
          <Form form={formState} onSubmit={(v) => void upload(v)}>
            <Stack>
              <Text size="md">
                Selected file:{" "}
                <Text inherit span ff="monospace">
                  {selectedFile.name}
                </Text>{" "}
                <Anchor onClick={resetFile}>select a different file</Anchor>
              </Text>
              <TextInput
                label="Delimiter"
                placeholder="For example ',' or ';'"
                sx={{ maxWidth: "6rem" }}
                {...formState.getInputProps("delimiter")}
              />

              <Group>
                <TextInput
                  label="ID column"
                  {...formState.getInputProps("idColName")}
                />
                <TextInput
                  label="Full name column"
                  {...formState.getInputProps("fullnameColName")}
                />
              </Group>

              <Button leftIcon={<IconUpload size="1rem" />} type="submit">
                Upload
              </Button>
            </Stack>
          </Form>
        )}
      </Modal>
    </>
  );
}

function ViewDropZone() {
  const setFile = useDropState((s) => s.setFile);
  const theme = useMantineTheme();

  const onDrop = (files: FileWithPath[]) => setFile(files[0] ?? null);

  return (
    <Dropzone onDrop={onDrop} maxSize={3 * 1024 ** 2} accept={[MIME_TYPES.csv]}>
      <Group
        position="center"
        spacing="xl"
        style={{ minHeight: rem(220), pointerEvents: "none" }}
      >
        <Dropzone.Accept>
          <IconUpload
            size="3.2rem"
            stroke={1.5}
            color={
              theme.colors[theme.primaryColor]?.[
                theme.colorScheme === "dark" ? 4 : 6
              ]
            }
          />
        </Dropzone.Accept>
        <Dropzone.Reject>
          <IconX
            size="3.2rem"
            stroke={1.5}
            color={theme.colors.red[theme.colorScheme === "dark" ? 4 : 6]}
          />
        </Dropzone.Reject>
        <Dropzone.Idle>
          <IconFile size="3.2rem" stroke={1.5} />
        </Dropzone.Idle>
        <div>
          <Text size="xl" inline>
            Drag your CSV file here
          </Text>
          <Text size="sm" color="dimmed" inline mt={7}>
            Or click here to select a file
          </Text>
        </div>
      </Group>
    </Dropzone>
  );
}
