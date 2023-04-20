import { Button, Loader, Table, Title } from "@mantine/core";
import type { GetServerSideProps } from "next";
import Link from "next/link";
import { useRouter } from "next/router";
import { useMemo } from "react";
import LinkBreadcrumbs, {
  type Link as BreadcrumbLink,
  crumbs,
} from "~/components/LinkBreadcrumbs";
import StandardLayout from "~/layouts/StandardLayout";
import { getServerAuthSession } from "~/server/auth";
import { api } from "~/utils/api";

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const session = await getServerAuthSession(ctx);

  return session?.user.role == "ADMIN"
    ? { props: { session } }
    : { notFound: true };
};

export default function YearAdminPage() {
  const router = useRouter();

  const year = api.years.get.useQuery(
    {
      year: Number(router.query.year as string),
    },
    { enabled: !!router.query.year && !Number.isNaN(router.query.year) }
  );

  const onDoubleClick = (year: number, item: string) => () =>
    void router.push(`/admin/year/${year}/${item}`);

  const rows = year.data?.items.map((i) => (
    <tr
      key={i.id}
      style={{ cursor: "pointer", userSelect: "none" }}
      onDoubleClick={onDoubleClick(i.yearId, i.id)}
    >
      <td>{i.name}</td>
      <td>{i.type}</td>
      <td>{i.items.length ?? 0}</td>
      <td>
        <Button
          color="indigo"
          compact
          component={Link}
          href={`/admin/year/${i.yearId}/${i.id}`}
        >
          Open
        </Button>
      </td>
    </tr>
  ));

  const breadcrumbs = useMemo(() => {
    const links: BreadcrumbLink[] = [crumbs.adminPage, crumbs.adminYears];

    if (year.data) {
      links.push({
        label: year.data.year.toString(),
        href: `/admin/year/${year.data.year}`,
      });
    }

    return <LinkBreadcrumbs my="md" links={links} />;
  }, [year]);

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

      <Title>{year.data.year}</Title>
      <Title order={3}>Groups: {year.data?.items.length ?? 0}</Title>

      <Table striped highlightOnHover>
        <thead>
          <tr>
            <th>Name</th>
            <th>Type</th>
            <th># of songs</th>
            <th align="right">Actions</th>
          </tr>
        </thead>
        <tbody>{rows}</tbody>
      </Table>
    </StandardLayout>
  );
}
