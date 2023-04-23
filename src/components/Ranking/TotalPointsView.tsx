import {
  Box,
  Loader,
  Paper,
  Text,
  Title,
  Transition,
  createStyles,
  rem,
} from "@mantine/core";
import { api } from "~/utils/api";
import FlagImage from "../Countries/FlagImage";
import type { CSSProperties } from "react";

interface TotalPointsViewProps {
  year: number;
  groupId: string;
}

const useStyles = createStyles((theme) => ({
  root: {
    userSelect: "none",
    // No styles on top, so it lines up with the tabs
    borderTop: "none",
    borderTopLeftRadius: 0,
    borderTopRightRadius: 0,
    transition: "ease 1s",
  },
  item: {
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

export default function TotalPointsView({
  year,
  groupId,
}: TotalPointsViewProps) {
  const total = api.group.totalPoints.useQuery({ year, id: groupId });
  const { classes } = useStyles();

  return (
    <Paper
      p="md"
      mb="md"
      shadow="md"
      radius="md"
      withBorder
      className={classes.root}
      style={{
        borderTop: "none",
      }}
    >
      <Title order={4}>Total points</Title>
      <Text mb="md" color="dimmed">
        These are the combined scores from everybody&apos;s ranking
      </Text>
      {total.isLoading && (
        <Box
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: "25rem",
          }}
        >
          <Loader />
        </Box>
      )}
      <Transition
        mounted={!total.isLoading}
        transition="slide-up"
        duration={500}
        timingFunction="ease"
      >
        {(styles) => (
          <TotalPointsList year={year} groupId={groupId} styles={styles} />
        )}
      </Transition>
    </Paper>
  );
}

function TotalPointsList({
  year,
  groupId,
  styles,
}: TotalPointsViewProps & { styles: CSSProperties }) {
  const total = api.group.totalPoints.useQuery({ year, id: groupId });
  const { classes } = useStyles();

  return (
    <>
      {total.data?.map((item, index) => (
        <Paper
          key={item.country.id}
          p="xs"
          mb="md"
          radius="sm"
          shadow="md"
          withBorder
          style={styles}
        >
          <Box className={classes.item}>
            <Box className={classes.rank}>
              <Text size="xl" weight="bold">
                {index + 1}
              </Text>
            </Box>
            <FlagImage code={item.country.isoCode} className={classes.flag} />
            {item.song && (
              <Box>
                <Text size="lg" weight="bold">
                  {item.song.title}
                </Text>
                <Text size="md">{item.song.artist}</Text>
              </Box>
            )}
            <div style={{ marginLeft: "auto" }}></div>

            <Box
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                marginRight: rem(15),
              }}
            >
              <Text fw="bold" size="lg">
                {item.points.toLocaleString()}
              </Text>{" "}
              <Text>points</Text>
            </Box>
          </Box>
        </Paper>
      ))}
    </>
  );
}
