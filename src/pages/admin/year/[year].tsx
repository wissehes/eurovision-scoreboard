import { Button, Loader, Table, Title } from "@mantine/core";
import type { GetServerSideProps } from "next";
import Link from "next/link";
import { useRouter } from "next/router";
import LinkBreadcrumbs from "~/components/LinkBreadcrumbs";
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
      onDoubleClick={onDoubleClick(i.eurovisionYearYear, i.id)}
    >
      <td>{i.name}</td>
      <td>{i.type}</td>
      <td>{i.items.length ?? 0}</td>
      <td>
        <Button
          color="indigo"
          compact
          component={Link}
          href={`/admin/year/${i.eurovisionYearYear}/${i.id}`}
        >
          Open
        </Button>
      </td>
    </tr>
  ));

  const breadcrumbs = (
    <LinkBreadcrumbs my="md" links={[{ label: "Admin", href: "/admin" }]} />
  );

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
      <Title order={3}>Items: {year.data?.items.length ?? 0}</Title>

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
