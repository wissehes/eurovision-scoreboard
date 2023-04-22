// Mantine components
import { Tabs, Text, Title } from "@mantine/core";

// Types
import type { RankingData } from "~/utils/ranking/getUserRanking";
import type { GetServerSideProps, InferGetServerSidePropsType } from "next";

// API & Hooks
import { useRouter } from "next/router";
import { useMemo } from "react";
import { api } from "~/utils/api";
import { getServerAuthSession } from "~/server/auth";
import { getUserRanking } from "~/utils/ranking/getUserRanking";

// Other components
import LinkBreadcrumbs, { type Link } from "~/components/LinkBreadcrumbs";
import StandardLayout from "~/layouts/StandardLayout";
import RankingView from "~/components/Ranking/RankingView";

export const getServerSideProps: GetServerSideProps<{
  data: RankingData;
}> = async (ctx) => {
  const session = await getServerAuthSession(ctx);
  if (!session)
    return { redirect: { destination: "/api/auth/signin", permanent: false } };

  const year = ctx.params?.year;
  const yearNumber = Number(year);
  const group = ctx.params?.group;

  if (
    !year ||
    Array.isArray(year) ||
    Number.isNaN(yearNumber) ||
    !group ||
    Array.isArray(group)
  )
    return { notFound: true };

  try {
    const data = await getUserRanking({
      userId: session.user.id,
      groupId: group,
      year: yearNumber,
    });

    return { props: { session, data: data } };
  } catch {
    return { notFound: true };
  }
};

export default function RankingPage({
  data: initialData,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  const router = useRouter();

  const year = Number(router.query.year as string | undefined);
  const groupId = router.query.group as string | undefined;

  const item = api.songs.getForRankedYearGroup.useQuery(
    {
      year,
      id: groupId as string,
    },
    { enabled: !Number.isNaN(year), initialData }
  );

  const breadcrumbs = useMemo(() => {
    const links: Link[] = [
      { label: "Home", href: "/" },
      { label: `${year}`, href: `/year/${year}` },
    ];

    if (item.data) {
      links.push({
        label: item.data.name,
        href: `/year/${item.data.year}/${item.data.id}`,
      });
    }

    return <LinkBreadcrumbs my="md" links={links} />;
  }, [item.data, year]);

  return (
    <StandardLayout title={`${item.data.name} - ${item.data.year}`}>
      {breadcrumbs}

      <Title mb="md">
        {year}: {item.data?.name}
      </Title>

      <Tabs keepMounted={false} defaultValue="ranking" variant="outline">
        <Tabs.List>
          <Tabs.Tab value="ranking">My Ranking</Tabs.Tab>
          <Tabs.Tab value="total">Total points</Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value="ranking">
          {!Number.isNaN(year) && groupId && (
            <RankingView
              year={year}
              groupId={groupId}
              initialData={initialData}
            />
          )}
        </Tabs.Panel>
        <Tabs.Panel value="total">
          <Text italic>Coming soon...</Text>
        </Tabs.Panel>
      </Tabs>
    </StandardLayout>
  );
}
