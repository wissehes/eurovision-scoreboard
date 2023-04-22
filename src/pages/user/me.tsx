import { Text, Title } from "@mantine/core";
import type { GetServerSideProps, NextPage } from "next";

import { env } from "~/env.mjs";
import { getServerAuthSession } from "~/server/auth";

import StandardLayout from "~/layouts/StandardLayout";

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const session = await getServerAuthSession(ctx);
  if (session) {
    return { props: { session } };
  } else {
    const callbackUrl = `${env.NEXTAUTH_URL}/account/me`;
    return {
      redirect: {
        destination: `/auth/signin?callbackUrl=${callbackUrl}`,
        permanent: false,
      },
    };
  }
};

const MePage: NextPage = () => {
  return (
    <StandardLayout title="Me">
      <Title>Account</Title>
      <Text italic>Coming soon...</Text>
    </StandardLayout>
  );
};
export default MePage;
