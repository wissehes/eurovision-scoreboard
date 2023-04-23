import { notifications } from "@mantine/notifications";
import { IconAlertCircle, IconCheck } from "@tabler/icons-react";

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

    songs: {
      previewUpdated: () => {
        notifications.show({
          title: "Previews updated!",
          message: "Song previews have been added.",
          icon: <IconCheck />,
          color: "green",
        });
      },

      songSaved: (type: "updated" | "created") => {
        notifications.show({
          title: `Song ${type}`,
          message: `Song ${type} and saved.`,
          icon: <IconCheck />,
          color: "green",
        });
      },
    },
  };
}
