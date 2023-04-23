import { Anchor, Button, Group, Table, Text, Title } from "@mantine/core";
import { IconRefresh } from "@tabler/icons-react";
import { type GetServerSideProps } from "next";
import { useMemo } from "react";
import LinkBreadcrumbs, { crumbs } from "~/components/LinkBreadcrumbs";
import EditSongButton from "~/components/Songs/EditSongButton";
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

const breadcrumbs = (
  <LinkBreadcrumbs
    links={[crumbs.adminPage, { label: "Songs", href: "/admin/songs" }]}
  />
);

export default function SongsAdminPage() {
  const ctx = api.useContext();
  const notify = useNotify();
  const songs = api.songs.getAll.useQuery();
  const update = api.songs.updatePreviews.useMutation({
    onSuccess: async () => {
      notify.songs.previewUpdated();
      await ctx.songs.getAll.invalidate();
    },
  });

  // Number of songs without a previewURL linked
  const songsWOPreview = useMemo(
    () =>
      songs.data && songs.data?.filter((s) => !s.previewURL).length.toString(),
    [songs.data]
  );

  return (
    <StandardLayout title="Songs">
      {breadcrumbs}
      <Title>Songs</Title>
      <Text>Songs: {songs.data?.length || <i>Loading...</i>}</Text>
      <Text mb="md">
        Songs without a preview: {songsWOPreview || <i>Loading...</i>}
      </Text>

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
            <th>Edit</th>
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
              <td>
                <EditSongButton songId={i.id} variant="filled" />
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    </StandardLayout>
  );
}
