import { Anchor, Button, Group, Table, Title } from "@mantine/core";
import { IconRefresh } from "@tabler/icons-react";
import { type GetServerSideProps } from "next";
import LinkBreadcrumbs, { crumbs } from "~/components/LinkBreadcrumbs";
import StandardLayout from "~/layouts/StandardLayout";
import { getServerAuthSession } from "~/server/auth";
import { api } from "~/utils/api";

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const session = await getServerAuthSession(ctx);

  return session?.user.role == "ADMIN"
    ? { props: { session } }
    : { notFound: true };
};

const breadcrumbs = (
  <LinkBreadcrumbs
    links={[crumbs.adminPage, { label: "Songs", href: "/admin/songs" }]}
  />
);

export default function SongsAdminPage() {
  const songs = api.songs.getAll.useQuery();
  const update = api.songs.updatePreviews.useMutation();

  return (
    <StandardLayout title="Songs">
      {breadcrumbs}
      <Title>Songs</Title>
      <Title order={3} mb="md">
        Songs: {songs.data?.length || <i>Loading...</i>}
      </Title>

      <Group mb="md">
        <Button
          leftIcon={<IconRefresh size="1rem" />}
          loading={update.isLoading}
          onClick={() => update.mutate()}
        >
          Update previews
        </Button>
      </Group>

      <Table striped>
        <thead>
          <tr>
            <th>Country</th>
            <th>Name</th>
            <th>Artist</th>
            <th>Preview</th>
            <th>Youtube</th>
          </tr>
        </thead>
        <tbody>
          {songs.data?.map((i) => (
            <tr key={i.id}>
              <td>{i.country.fullname}</td>
              <td>{i.title}</td>
              <td>{i.artist}</td>
              <td>
                {i.previewURL ? (
                  <Anchor href={i.previewURL} target="_blank">
                    Open
                  </Anchor>
                ) : (
                  <i>None</i>
                )}
              </td>
              <td>
                <Anchor href={i.youtubeURL} target="_blank">
                  Open
                </Anchor>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    </StandardLayout>
  );
}
