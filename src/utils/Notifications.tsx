import { notifications } from "@mantine/notifications";
import { IconAlertCircle } from "@tabler/icons-react";

interface ErrorNotificationArgs {
  message: string;
}

export function useNotify() {
  return {
    onError: ({ message }: ErrorNotificationArgs) => {
      notifications.show({
        title: "Oh no!",
        message: message,
        icon: <IconAlertCircle />,
        color: "red",
      });
    },
  };
}
