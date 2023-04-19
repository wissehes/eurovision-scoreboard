import { Button, Group, Table, Text, TextInput, Title } from "@mantine/core";
import { Form, useForm } from "@mantine/form";
import UploadCSVModal from "~/components/Countries/UploadCSVModal";
import LinkBreadcrumbs from "~/components/LinkBreadcrumbs";
import StandardLayout from "~/layouts/StandardLayout";
import { api } from "~/utils/api";

interface FormValues {
  abbreviation: string;
  fullname: string;
}

const initialValues: FormValues = { abbreviation: "", fullname: "" };

export default function CountriesAdminPage() {
  const context = api.useContext();
  const countries = api.countries.getAll.useQuery();
  const createCountry = api.countries.create.useMutation({
    onSuccess: async () => {
      form.reset();
      await context.countries.getAll.invalidate();
    },
  });

  const form = useForm({
    initialValues,
    validate: {
      abbreviation: (v) => (v.trim().length == 0 ? "Can't be empty" : null),
      fullname: (v) => (v.trim().length == 0 ? "Can't be empty" : null),
    },
  });

  const onSubmit = (v: FormValues) => {
    createCountry.mutate(v);
  };

  const breadcrumbs = (
    <LinkBreadcrumbs my="md" links={[{ label: "Admin", href: "/admin" }]} />
  );

  const rows = countries.data?.map((c) => (
    <tr key={c.id}>
      <td>{c.id}</td>
      <td align="left">{c.fullname}</td>
      <td>{c._count.items}</td>
    </tr>
  ));

  return (
    <StandardLayout title="Countries">
      {breadcrumbs}
      <Title>Countries</Title>
      <Title order={3}>Items: {countries.data?.length ?? 0}</Title>

      <Group>
        <Form form={form} onSubmit={onSubmit}>
          <Group>
            <TextInput
              label="Abbreviation"
              type="text"
              {...form.getInputProps("abbreviation")}
            />
            <TextInput
              label="Full name"
              type="text"
              {...form.getInputProps("fullname")}
            />

            <Button type="submit" mt="xl">
              Add
            </Button>
          </Group>
        </Form>
        <UploadCSVModal
          buttonProps={{ color: "indigo", variant: "outline", mt: "xl" }}
        />
      </Group>

      <Table striped>
        <thead>
          <tr>
            <th>ID</th>
            <th align="left">Full name</th>
            <th># of songs</th>
          </tr>
        </thead>
        <tbody>{rows}</tbody>
      </Table>
      <>
        {rows?.length == 0 && (
          <Text align="center" mt="xl">
            No countries yet...
          </Text>
        )}
      </>
    </StandardLayout>
  );
}
