import type { FileWithPath } from "@mantine/dropzone";

export interface DropState {
  selectedFile: FileWithPath | null;
  setFile: (to: FileWithPath | null) => void;
  reset: () => void;
}
