import { Loader, Text, Title } from "@mantine/core";
import type { EurovisionGroup, EurovisionYear, SongItem } from "@prisma/client";
import type { GetServerSideProps, InferGetServerSidePropsType } from "next";
import Link from "next/link";
import { useRouter } from "next/router";
import { useMemo } from "react";
import LinkBreadcrumbs, { crumbs } from "~/components/LinkBreadcrumbs";
import MyList from "~/components/List/MyList";
import StandardLayout from "~/layouts/StandardLayout";
import { prisma } from "~/server/db";
import { api } from "~/utils/api";

type YearData = EurovisionYear & {
  items: (EurovisionGroup & {
    items: SongItem[];
  })[];
};

export const getServerSideProps: GetServerSideProps<{
  yearData: YearData;
}> = async (ctx) => {
  const year = ctx.params?.year;
  const yearNumber = Number(year);
  if (!year || Array.isArray(year) || Number.isNaN(yearNumber))
    return { notFound: true };

  const yearData = await prisma.eurovisionYear.findUnique({
    where: { year: yearNumber },
    include: {
      items: { include: { items: true }, orderBy: { type: "asc" } },
    },
  });
  if (!yearData) return { notFound: true };

  return { props: { yearData } };
};

export default function YearPage({
  yearData,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  const router = useRouter();

  const yearN = router.query.year as string | undefined;

  const year = api.years.get.useQuery(
    { year: Number(yearN) },
    {
      enabled: !!router.query.year && !Number.isNaN(yearN),
      initialData: yearData,
    }
  );

  const breadcrumbs = useMemo(() => {
    const links: { label: string; href: string }[] = [
      crumbs.homePage,
      { label: yearN ?? "", href: `/year/${yearN ?? ""}` },
    ];

    return <LinkBreadcrumbs my="md" links={links} />;
  }, [yearN]);

  if (year.isLoading || !year.data) {
    return (
      <StandardLayout title="Year items">
        {breadcrumbs}
        <Loader />
      </StandardLayout>
    );
  }

  return (
    <StandardLayout title="Year items">
      {breadcrumbs}

      <Title mb="md">{year.data.year}</Title>

      <MyList>
        {year.data?.items.map((i) => (
          <MyList.Item
            key={i.id}
            component={Link}
            href={`/year/${i.yearId}/${i.id}`}
          >
            <Title order={2} style={{ padding: "1rem" }}>
              {i.name}
            </Title>

            <Text color="dimmed" sx={{ marginLeft: "auto" }} mr="md">
              {i.items.length} Songs
            </Text>

            <MyList.Chevron ml={false} />
          </MyList.Item>
        ))}

        {!year.isLoading && year.data?.items.length == 0 && (
          <Title order={3} style={{ padding: "1rem", textAlign: "center" }}>
            <i>No items yet...</i>
          </Title>
        )}
      </MyList>
    </StandardLayout>
  );
}
