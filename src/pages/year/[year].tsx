import { Button, Loader, Table, Title } from "@mantine/core";
import Link from "next/link";
import { useRouter } from "next/router";
import { useMemo } from "react";
import LinkBreadcrumbs from "~/components/LinkBreadcrumbs";
import StandardLayout from "~/layouts/StandardLayout";
import { api } from "~/utils/api";

export default function YearPage() {
  const router = useRouter();

  const year = api.years.get.useQuery(
    {
      year: Number(router.query.year as string),
    },
    { enabled: !!router.query.year && !Number.isNaN(router.query.year) }
  );

  const onDoubleClick = (year: number, item: string) => () =>
    void router.push(`/year/${year}/${item}`);

  const rows = year.data?.items.map((i) => (
    <tr
      key={i.id}
      style={{ cursor: "pointer", userSelect: "none" }}
      onDoubleClick={onDoubleClick(i.eurovisionYearYear, i.id)}
    >
      <td>{i.name}</td>
      <td>{i.items.length ?? 0}</td>
      <td>
        <Button
          color="indigo"
          compact
          component={Link}
          href={`/year/${i.eurovisionYearYear}/${i.id}`}
        >
          Open
        </Button>
      </td>
    </tr>
  ));

  const breadcrumbs = useMemo(() => {
    const links: { label: string; href: string }[] = [
      { label: "Home", href: "/" },
      { label: "All years", href: "/year" },
    ];

    if (year.data) {
      links.push({
        label: year.data?.year.toString(),
        href: `/year/${year.data?.year}`,
      });
    }

    return <LinkBreadcrumbs my="md" links={links} />;
  }, [year.data]);

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
            <th># of songs</th>
            <th align="right">Actions</th>
          </tr>
        </thead>
        <tbody>{rows}</tbody>
      </Table>
    </StandardLayout>
  );
}
