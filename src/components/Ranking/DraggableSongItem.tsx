import { ActionIcon, Box, Group, Text, createStyles, rem } from "@mantine/core";
import type { Country, SongItem } from "@prisma/client";
import FlagImage from "../Countries/FlagImage";
import { IconBrandYoutube } from "@tabler/icons-react";
import dynamic from "next/dynamic";

type Song = SongItem & {
  country: Country;
};

interface SongItemProps {
  song: Song;
  index: number;
}

const useStyles = createStyles((theme) => ({
  root: {
    display: "flex",
    alignItems: "center",
  },

  rank: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    paddingRight: "1rem",
    paddingLeft: "1rem",

    width: "2.5rem",
  },

  icon: {
    marginLeft: "auto",
    marginRight: "1.5rem",
    [theme.fn.smallerThan("xs")]: {
      marginRight: "0.5rem",
      flexDirection: "column",
    },
  },

  flag: {
    maxWidth: rem(45),
    marginRight: rem(25),
    [theme.fn.smallerThan("xs")]: {
      marginRight: rem(10),
    },
  },
}));

const PreviewPlayer = dynamic(() => import("../Songs/PreviewPlayer"), {
  ssr: false,
});

export const DraggableSongItem = ({ song, index }: SongItemProps) => {
  const { classes } = useStyles();

  return (
    <Box className={classes.root}>
      <>
        <Box className={classes.rank}>
          <Text size="xl" weight="bold">
            {index + 1}
          </Text>
        </Box>

        <FlagImage code={song.country.isoCode} className={classes.flag} />
        <Box>
          <Text size="lg" weight="bold">
            {song.title}
          </Text>
          <Text size="md">{song.artist}</Text>
        </Box>

        <Group className={classes.icon} position="right">
          <PreviewPlayer
            previewURL={song.previewURL ?? undefined}
            color="pink"
            size="md"
          />

          <ActionIcon
            color="red"
            size="md"
            component={"a"}
            href={song.youtubeURL}
            target="_blank"
            title={`Watch ${song.title} on YouTube`}
          >
            <IconBrandYoutube />
          </ActionIcon>
        </Group>
      </>
    </Box>
  );
};
