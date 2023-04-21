import { Anchor, Group, Table, Title } from "@mantine/core";
import { useRouter } from "next/router";
import { useMemo } from "react";
import AddExistingSongModal from "~/components/Groups/AddExistingSongModal";
import LinkBreadcrumbs, {
  type Link,
  crumbs,
} from "~/components/LinkBreadcrumbs";
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
    { enabled: !Number.isNaN(year) }
  );

  const breadcrumbs = useMemo(() => {
    const links: Link[] = [crumbs.adminPage, crumbs.adminYears];

    if (item.data) {
      links.push({
        label: item.data.yearId.toString(),
        href: `/admin/year/${item.data.yearId}`,
      });
      links.push({
        label: item.data.name,
        href: `/admin/year/${item.data.yearId}/${item.data.id}`,
      });
    }

    return <LinkBreadcrumbs my="md" links={links} />;
  }, [item]);

  return (
    <StandardLayout title="Year item">
      {breadcrumbs}

      <Title mb="md">
        {year}: {item.data?.name}
      </Title>
      <Group>
        <>
          {!!groupId && (
            <>
              <AddSongDialog id={groupId} year={year} />
              <AddExistingSongModal groupId={groupId} year={year} />
            </>
          )}
        </>
      </Group>
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
