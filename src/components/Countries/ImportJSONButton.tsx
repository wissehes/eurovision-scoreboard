import {
  Button,
  Modal,
  type ButtonProps,
  useMantineTheme,
  Group,
  rem,
  Text,
  Stack,
  Anchor,
} from "@mantine/core";
import { type FileWithPath, Dropzone } from "@mantine/dropzone";
import { useDisclosure } from "@mantine/hooks";
import { IconFile, IconUpload, IconX } from "@tabler/icons-react";
import { create } from "zustand";
import type { DropState } from "~/utils/DropState";
import { useNotify } from "~/utils/Notifications";
import { api } from "~/utils/api";
import delay from "~/utils/delay";

const useDropState = create<DropState>((set) => ({
  selectedFile: null,
  setFile: (v) => set({ selectedFile: v }),
  reset: () => set({ selectedFile: null }),
}));

export default function ImportJSONButton(props: ButtonProps) {
  const context = api.useContext();
  const [opened, { open, close }] = useDisclosure(false);

  const selectedFile = useDropState((s) => s.selectedFile);
  const resetFile = useDropState((s) => s.reset);

  const notify = useNotify();

  const mutation = api.countries.importFromJSON.useMutation({
    onError: notify.onError,
    onSuccess: async () => {
      close();
      await context.countries.getAll.invalidate();
      await delay(250);
      resetFile();
      mutation.reset();
    },
  });

  const upload = async () => {
    if (!selectedFile) return;
    mutation.mutate({ json: await selectedFile?.text() });
  };

  return (
    <>
      <Button onClick={open} {...props}>
        Import JSON
      </Button>

      <Modal
        opened={opened}
        onClose={close}
        title="Upload JSON Data"
        size="md"
        centered
      >
        {!selectedFile && <ViewDropZone />}
        {selectedFile && (
          <Stack>
            <Text size="md">
              Selected file:{" "}
              <Text inherit span ff="monospace">
                {selectedFile.name}
              </Text>{" "}
              <Anchor onClick={resetFile}>select a different file</Anchor>
            </Text>

            <Button
              onClick={() => void upload()}
              leftIcon={<IconUpload size="1rem" />}
              loading={mutation.isLoading || mutation.isSuccess}
            >
              Upload
            </Button>
          </Stack>
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
    <Dropzone
      onDrop={onDrop}
      maxSize={3 * 1024 ** 2}
      accept={["application/json"]}
    >
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
            Drag & drop your JSON file here
          </Text>
          <Text size="sm" color="dimmed" inline mt={7}>
            Or click here to select a file
          </Text>
        </div>
      </Group>
    </Dropzone>
  );
}
