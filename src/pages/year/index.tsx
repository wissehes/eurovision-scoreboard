import { Button, Table, Title } from "@mantine/core";
import Link from "next/link";
import { useRouter } from "next/router";
import LinkBreadcrumbs from "~/components/LinkBreadcrumbs";
import StandardLayout from "~/layouts/StandardLayout";
import { api } from "~/utils/api";

export default function YearsPage() {
  const years = api.years.getAll.useQuery();
  const router = useRouter();

  const onDoubleClick = (year: number) => () =>
    void router.push(`/year/${year}`);

  const rows = years.data?.map((y) => (
    <tr
      key={y.year}
      style={{ cursor: "pointer", userSelect: "none" }}
      onDoubleClick={onDoubleClick(y.year)}
    >
      <td>{y.year}</td>
      <td>{y.items.length ?? 0}</td>
      <td>
        <Button
          color="indigo"
          compact
          component={Link}
          href={`/year/${y.year}`}
        >
          Open
        </Button>
      </td>
    </tr>
  ));

  const breadcrums = (
    <LinkBreadcrumbs
      my="md"
      links={[
        { label: "Home", href: "/" },
        { label: "All years", href: "/year" },
      ]}
    />
  );

  return (
    <StandardLayout title="Years">
      {breadcrums}
      <Title>Available years</Title>

      <Table striped highlightOnHover>
        <thead>
          <tr>
            <th>Year</th>
            <th># of items</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>{rows}</tbody>
      </Table>
    </StandardLayout>
  );
}
