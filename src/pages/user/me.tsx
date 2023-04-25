import { ActionIcon, Box, Group, Text, Title, Tooltip } from "@mantine/core";
import type {
  GetServerSideProps,
  InferGetServerSidePropsType,
  NextPage,
} from "next";

import { env } from "~/env.mjs";
import { getServerAuthSession } from "~/server/auth";

import StandardLayout from "~/layouts/StandardLayout";
import { prisma } from "~/server/db";
import ProfileAvatar from "~/components/ProfileAvatar";
import UpdateNameButton from "~/components/User/UpdateNameButton";
import { api } from "~/utils/api";
import { getProviders, signIn } from "next-auth/react";
import { type Provider, colors, icons } from "~/utils/auth/authPage";
import { IconLogin } from "@tabler/icons-react";

const getMe = (id: string) =>
  prisma.user.findUnique({
    where: { id },
    include: { accounts: { select: { provider: true } } },
  });

type MeData = NonNullable<Awaited<ReturnType<typeof getMe>>>;

export const getServerSideProps: GetServerSideProps<{
  me: MeData;
  providers: Provider[];
}> = async (ctx) => {
  const session = await getServerAuthSession(ctx);
  const me = session ? await getMe(session.user.id) : null;
  const providers = (await getProviders()) ?? {};
  const providersArray: Provider[] =
    Object.values(providers as { [key: string]: Provider }) ?? [];

  if (session && me) {
    return {
      props: {
        session,
        me: JSON.parse(JSON.stringify(me)) as MeData,
        providers: providersArray,
      },
    };
  } else {
    const callbackUrl = `${env.NEXTAUTH_URL}/user/me`;
    return {
      redirect: {
        destination: `/auth/signin?callbackUrl=${callbackUrl}`,
        permanent: false,
      },
    };
  }
};

const MePage: NextPage<
  InferGetServerSidePropsType<typeof getServerSideProps>
> = ({ me: _me, providers }) => {
  const { data: me } = api.users.me.useQuery(undefined, {
    initialData: _me,
    initialDataUpdatedAt: Date.now(),
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });
  return (
    <StandardLayout title="Me">
      <Title mb="md">Account</Title>
      <Group align="end">
        <ProfileAvatar size="xl" radius="md" />
        <div>
          <Title order={2}>{me.name ?? <i>No name</i>}</Title>
          <UpdateNameButton update="Update" />
        </div>
      </Group>

      <Box my="md">
        <Text>
          <b>Email:</b> {me.email || <i>None</i>}
        </Text>
        {me.accounts[0] && (
          <Text>
            <b>Sign in {me.accounts.length == 1 ? "method" : "methods"}: </b>
            {me.accounts.map((a) => a.provider).join(", ")}
          </Text>
        )}

        <Text>
          <b>Join date: </b>
          {new Date(me.joined).toLocaleDateString("en-GB")}
        </Text>

        <Text weight="bold">Connect accounts</Text>
        <Group>
          {providers
            .filter((p) => !me.accounts.find((a) => a.provider == p.id))
            .map((p) => (
              <ProviderButton key={p.id} provider={p} />
            ))}
        </Group>
      </Box>
    </StandardLayout>
  );
};
export default MePage;

function ProviderButton({ provider: p }: { provider: Provider }) {
  const color = colors[p.id] ?? "blue";
  const Icon = icons[p.id] ?? IconLogin;

  const onClick = () => void signIn(p.id);

  return (
    <Tooltip label={p.name}>
      <ActionIcon color={color} variant="filled" size="lg" onClick={onClick}>
        <Icon size="1.5rem" />
      </ActionIcon>
    </Tooltip>
  );
}
