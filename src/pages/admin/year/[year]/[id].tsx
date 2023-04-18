import { Anchor, Table, Title } from "@mantine/core";
import { useRouter } from "next/router";
import LinkBreadcrumbs from "~/components/LinkBreadcrumbs";
import AddSongDialog from "~/components/Songs/AddSongDialog";
import StandardLayout from "~/layouts/StandardLayout";
import { api } from "~/utils/api";

export default function ItemAdminPage() {
  const router = useRouter();

  const year = Number(router.query.year as string | undefined);
  const groupId = router.query.id as string | undefined;

  const item = api.songs.getForYearItem.useQuery(
    {
      year,
      id: groupId as string,
    },
    { enabled: !Number.isNaN(router.query.year) }
  );

  return (
    <StandardLayout title="Year item">
      <LinkBreadcrumbs
        my="md"
        links={[
          { label: "Admin", href: "/admin" },
          { label: `${year}`, href: `/admin/year/${year}` },
        ]}
      />

      <Title mb="md">
        {year}: {item.data?.name}
      </Title>

      <>{!!groupId && <AddSongDialog id={groupId} year={year} />}</>

      <Table mt="md">
        <thead>
          <tr>
            <th>Country</th>
            <th>Song title</th>
            <th>Artist</th>
            <th>YouTube URL</th>
          </tr>
        </thead>
        <tbody>
          {item.data?.items.map((i) => (
            <tr key={i.id}>
              <td>{i.country.fullname}</td>
              <td>{i.title}</td>
              <td>{i.artist}</td>
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
