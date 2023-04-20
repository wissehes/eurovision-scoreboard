import {
  Button,
  Group,
  Loader,
  Select,
  Table,
  TextInput,
  Title,
} from "@mantine/core";
import { Form, useForm } from "@mantine/form";
import type { EurovisionType } from "@prisma/client";
import { IconPlus } from "@tabler/icons-react";
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
import { useNotify } from "~/utils/Notifications";
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

      <AddGroupForm year={year.data.year} />

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

const types: { label: string; value: EurovisionType }[] = [
  { label: "Grand final", value: "GRAND_FINAL" },
  { label: "First semi final", value: "SEMI_1" },
  { label: "Second semi final", value: "SEMI_2" },
  { label: "National Final", value: "NATIONAL_FINAL" },
  { label: "Other group", value: "GROUP" },
];

interface FormValues {
  name: string;
  type: EurovisionType;
}

const initialValues: FormValues = {
  name: "",
  type: "GRAND_FINAL",
};

function AddGroupForm({ year }: { year: number }) {
  const notify = useNotify();
  const context = api.useContext();
  const form = useForm({
    initialValues,
  });

  const create = api.group.create.useMutation({
    onError: notify.onError,
    onSuccess: async () => {
      form.reset();
      await context.years.get.invalidate({ year });
    },
  });

  const mutate = (v: FormValues) => {
    create.mutate({ year, ...v });
  };

  return (
    <Form form={form} onSubmit={mutate}>
      <Group>
        <TextInput
          label="Name"
          placeholder="Name..."
          disabled={create.isLoading}
          {...form.getInputProps("name")}
        />
        <Select
          label="Type"
          searchable
          data={types}
          disabled={create.isLoading}
          {...form.getInputProps("type")}
        />

        <Button
          type="submit"
          leftIcon={<IconPlus size="1rem" />}
          mt="xl"
          loading={create.isLoading}
        >
          Add
        </Button>
      </Group>
    </Form>
  );
}
