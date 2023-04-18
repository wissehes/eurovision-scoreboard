import { Button, Table, Title } from "@mantine/core";
import StandardLayout from "~/layouts/StandardLayout";

import type { GetServerSideProps } from "next";
import Link from "next/link";
import { useRouter } from "next/router";
import { getServerAuthSession } from "~/server/auth";
import { api } from "~/utils/api";

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const session = await getServerAuthSession(ctx);

  return session?.user.role == "ADMIN"
    ? { props: { session } }
    : { notFound: true };
};

export default function AdminPage() {
  const years = api.years.getAll.useQuery();
  const router = useRouter();

  const onDoubleClick = (year: number) => () =>
    void router.push(`/admin/year/${year}`);

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
          href={`/admin/year/${y.year}`}
        >
          Open
        </Button>
      </td>
    </tr>
  ));

  // Year
  // # items
  // Open(button)
  return (
    <StandardLayout title="Years">
      <Title>Years</Title>

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
