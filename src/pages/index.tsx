import {
  Box,
  Button,
  Flex,
  LoadingOverlay,
  Paper,
  Stack,
  Title,
  UnstyledButton,
  createStyles,
} from "@mantine/core";
import { IconChevronRight, IconLogin } from "@tabler/icons-react";
import { type NextPage } from "next";
import { signIn, useSession } from "next-auth/react";
import Link from "next/link";
import StandardLayout from "~/layouts/StandardLayout";
import { api } from "~/utils/api";

const Home: NextPage = () => {
  return (
    <StandardLayout title="Home">
      <HomePageView />
    </StandardLayout>
  );
};

const HomePageView = () => {
  const session = useSession();

  if (session.status == "loading") {
    return <LoadingOverlay visible={true} />;
  }

  if (session.status == "unauthenticated") {
    return (
      <Flex
        style={{ alignItems: "center", flexDirection: "column", gap: "1rem" }}
      >
        <Title>Please sign in to use Eurovision Scoreboard</Title>
        <Button
          leftIcon={<IconLogin size="1rem" />}
          onClick={() => void signIn()}
        >
          Sign in
        </Button>
      </Flex>
    );
  }
  return (
    <>
      <Title mb="md">Choose a year</Title>
      <YearList />
    </>
  );
};

export default Home;

const useStyles = createStyles(() => ({
  item: {
    display: "flex",
    alignItems: "center",
  },
  icon: {
    display: "flex",
    alignItems: "center",
    marginLeft: "auto",
  },
}));

function YearList() {
  const years = api.years.getAll.useQuery();

  const { classes } = useStyles();

  return (
    <>
      <LoadingOverlay visible={years.isLoading} />
      <Paper
        p="md"
        shadow="md"
        radius="md"
        withBorder
        style={{ userSelect: "none" }}
      >
        <Stack>
          {years.data?.map((y) => (
            <UnstyledButton
              key={y.year}
              component={Link}
              href={`/year/${y.year}`}
            >
              <Paper
                p="xs"
                radius="sm"
                shadow="md"
                withBorder
                className={classes.item}
              >
                <Title order={2} style={{ padding: "1rem" }}>
                  {y.year}
                </Title>

                <Box className={classes.icon}>
                  <IconChevronRight size="2rem" color="gray" />
                </Box>
              </Paper>
            </UnstyledButton>
          ))}
        </Stack>
      </Paper>
    </>
  );
}
