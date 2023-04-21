import {
  Button,
  Container,
  Divider,
  Paper,
  Stack,
  Text,
  Title,
} from "@mantine/core";
import { IconArrowLeft } from "@tabler/icons-react";

import type {
  NextPage,
  GetServerSideProps,
  InferGetServerSidePropsType,
} from "next";
import { getProviders } from "next-auth/react";
import { NextSeo } from "next-seo";
import { useRouter } from "next/router";
import { useMemo } from "react";
import ErrorAlert from "~/components/Auth/SignIn/ErrorAlert";
import SignInButton from "~/components/Auth/SignIn/SignInButton";
import { getServerAuthSession } from "~/server/auth";
import { signinErrors, type Provider } from "~/utils/auth/authPage";

export const getServerSideProps: GetServerSideProps<{
  providers: Provider[];
}> = async (ctx) => {
  const session = await getServerAuthSession(ctx);

  if (session) {
    const callbackUrl = ctx.query.callbackUrl as string | null;
    return {
      redirect: { destination: callbackUrl || "/", permanent: false },
    };
  }

  const providers = await getProviders();
  const providersArray: Provider[] = Object.values(
    providers as { [key: string]: Provider }
  );

  return { props: { providers: providersArray } };
};

const SigninPage: NextPage<
  InferGetServerSidePropsType<typeof getServerSideProps>
> = (props) => {
  const router = useRouter();

  const error = useMemo(() => {
    const errorCode = router.query.error;

    if (errorCode && typeof errorCode === "string") {
      return signinErrors[errorCode.toLowerCase()];
    }
  }, [router]);

  const goBack = () => {
    const callback = router.query.callbackUrl as string | undefined;
    if (callback) {
      void router.push(callback);
    } else {
      void router.push("/");
    }
  };
  return (
    <>
      <NextSeo
        title="Sign In"
        description={`Sign in to Eurovision Scoreboard using your preferred app/website.`}
      />
      <main>
        <Container size={500} my={40}>
          <Title
            align="center"
            sx={(theme) => ({
              fontFamily: `Greycliff CF, ${theme.fontFamily || ""}`,
              fontWeight: 900,
            })}
          >
            Welcome back to <LogoText /> ✨
          </Title>

          <Paper withBorder shadow="md" p={30} mt={30} radius="md" maw={500}>
            {error && <ErrorAlert error={error} />}

            <Text size="lg" weight={500} align="center" mb="md">
              Sign in using...
            </Text>

            <Stack spacing="xs">
              {props.providers
                .filter((a) => a.id !== "email")
                .map((provider) => (
                  <SignInButton key={provider.id} provider={provider} />
                ))}

              <Divider label="Or" labelPosition="center" />

              <Button
                variant="outline"
                leftIcon={<IconArrowLeft size="1rem" />}
                onClick={goBack}
              >
                Go back
              </Button>
            </Stack>
          </Paper>
        </Container>
      </main>
    </>
  );
};

export default SigninPage;

function LogoText() {
  return (
    <Text
      variant="gradient"
      gradient={{ from: "violet", to: "pink", deg: 45 }}
      ta="center"
      span
      inherit
    >
      Eurovision Scoreboard
    </Text>
  );
}
