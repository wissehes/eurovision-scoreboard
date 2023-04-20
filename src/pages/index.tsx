import {
  Button,
  Flex,
  LoadingOverlay,
  Title,
  createStyles,
} from "@mantine/core";
import { IconLogin } from "@tabler/icons-react";
import { type NextPage } from "next";
import { signIn, useSession } from "next-auth/react";
import Link from "next/link";
import MyList from "~/components/List/MyList";
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

      <MyList>
        {years.data?.map((y) => (
          <MyList.Item key={y.year} component={Link} href={`/year/${y.year}`}>
            <Title order={2} style={{ padding: "1rem" }}>
              {y.year}
            </Title>

            <MyList.Chevron />
          </MyList.Item>
        ))}
      </MyList>
    </>
  );
}
