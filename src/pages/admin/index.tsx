import { Button, Group } from "@mantine/core";
import type { GetServerSideProps } from "next";
import Link from "next/link";
import StandardLayout from "~/layouts/StandardLayout";
import { getServerAuthSession } from "~/server/auth";

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const session = await getServerAuthSession(ctx);

  return session?.user.role == "ADMIN"
    ? { props: { session } }
    : { notFound: true };
};

export default function AdminPage() {
  return (
    <StandardLayout title="Admin">
      <Group>
        <Button component={Link} href="/admin/year">
          Years
        </Button>
        <Button component={Link} href="/admin/countries">
          Countries
        </Button>
      </Group>
    </StandardLayout>
  );
}
