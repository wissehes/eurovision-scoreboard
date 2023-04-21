import { Alert } from "@mantine/core";
import { IconAlertCircle } from "@tabler/icons-react";

export default function ErrorAlert({ error }: { error: string }) {
  return (
    <Alert
      title="Oh no! Something went wrong."
      mb="md"
      icon={<IconAlertCircle size="1rem" />}
      color="red"
      variant="filled"
    >
      {error}
    </Alert>
  );
}
