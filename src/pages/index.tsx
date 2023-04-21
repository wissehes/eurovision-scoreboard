import { Button, Flex, Loader, Title } from "@mantine/core";
import { IconLogin } from "@tabler/icons-react";
import { type NextPage } from "next";
import { signIn, useSession } from "next-auth/react";
import Link from "next/link";
import MyList from "~/components/List/MyList";
import StandardLayout from "~/layouts/StandardLayout";
import { api } from "~/utils/api";

const LoadingView = () => (
  <Flex
    style={{
      justifyContent: "center",
      alignItems: "center",
      height: "70vh",
    }}
  >
    <Loader />
  </Flex>
);

const Home: NextPage = () => {
  return (
    <StandardLayout title="Home">
      <HomePageView />
    </StandardLayout>
  );
};

const HomePageView = () => {
  const session = useSession();
  const years = api.years.getAll.useQuery();

  if (session.status == "loading" || years.isLoading) {
    return <LoadingView />;
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

function YearList() {
  const years = api.years.getAll.useQuery();

  return (
    <>
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
