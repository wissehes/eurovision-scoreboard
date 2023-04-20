import { Button, Group, NumberInput, Table, Title } from "@mantine/core";
import StandardLayout from "~/layouts/StandardLayout";

import type { GetServerSideProps } from "next";
import Link from "next/link";
import { useRouter } from "next/router";
import { getServerAuthSession } from "~/server/auth";
import { api } from "~/utils/api";
import { Form, useForm } from "@mantine/form";
import { IconPlus } from "@tabler/icons-react";
import { useNotify } from "~/utils/Notifications";
import LinkBreadcrumbs, { crumbs } from "~/components/LinkBreadcrumbs";

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

  const breadcrumbs = (
    <LinkBreadcrumbs my="md" links={[crumbs.adminPage, crumbs.adminYears]} />
  );

  return (
    <StandardLayout title="Years">
      {breadcrumbs}
      <Title>Years</Title>

      <AddYearForm />

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

interface FormValues {
  year: number;
}

const initialValues: FormValues = { year: new Date().getFullYear() };

function AddYearForm() {
  const form = useForm({
    initialValues,
    validate: {
      year: (v) =>
        v ? (v >= 1950 ? null : "Minimum of 1950") : "Can't be empty.",
    },
  });
  const notify = useNotify();

  const context = api.useContext();
  const mutation = api.years.create.useMutation({
    onError: notify.onError,
    onSuccess: async () => {
      form.reset();
      await context.years.getAll.invalidate();
    },
  });

  const create = (v: FormValues) => {
    form.validate();
    if (!v.year || !form.isValid) return;
    mutation.mutate(v);
  };

  return (
    <Form form={form} onSubmit={create}>
      <Group>
        <NumberInput label="Year" {...form.getInputProps("year")} />

        <Button
          type="submit"
          leftIcon={<IconPlus size="1rem" />}
          mt="xl"
          loading={mutation.isLoading}
        >
          Add
        </Button>
      </Group>
    </Form>
  );
}
