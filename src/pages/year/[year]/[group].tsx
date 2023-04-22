// Mantine components
import { Tabs, Title } from "@mantine/core";

// Types
import type { RankingData } from "~/utils/ranking/getUserRanking";
import type { GetServerSideProps, InferGetServerSidePropsType } from "next";

// API & Hooks
import { useRouter } from "next/router";
import { useMemo } from "react";
import { getServerAuthSession } from "~/server/auth";
import { getUserRanking } from "~/utils/ranking/getUserRanking";

// Other components
import LinkBreadcrumbs, { type Link } from "~/components/LinkBreadcrumbs";
import StandardLayout from "~/layouts/StandardLayout";
import RankingView from "~/components/Ranking/RankingView";
import TotalPointsView from "~/components/Ranking/TotalPointsView";

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

  const breadcrumbs = useMemo(() => {
    const links: Link[] = [
      { label: "Home", href: "/" },
      { label: `${year}`, href: `/year/${year}` },
      {
        label: initialData.name,
        href: `/year/${initialData.year}/${initialData.id}`,
      },
    ];

    return <LinkBreadcrumbs my="md" links={links} />;
  }, [year, initialData]);

  return (
    <StandardLayout title={`${initialData.name} - ${initialData.year}`}>
      {breadcrumbs}

      <Title mb="md">
        {year}: {initialData.name}
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
          {!Number.isNaN(year) && groupId && (
            <TotalPointsView year={year} groupId={groupId} />
          )}
        </Tabs.Panel>
      </Tabs>
    </StandardLayout>
  );
}
