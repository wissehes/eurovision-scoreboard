import { Anchor, Table, Title } from "@mantine/core";
import { useRouter } from "next/router";
import { useMemo } from "react";
import LinkBreadcrumbs, { type Link } from "~/components/LinkBreadcrumbs";
import StandardLayout from "~/layouts/StandardLayout";
import { api } from "~/utils/api";

export default function ItemAdminPage() {
  const router = useRouter();

  const year = Number(router.query.year as string | undefined);
  const groupId = router.query.group as string | undefined;

  const item = api.songs.getForYearItem.useQuery(
    {
      year,
      id: groupId as string,
    },
    { enabled: !Number.isNaN(router.query.year) }
  );

  const breadcrumbs = useMemo(() => {
    const links: Link[] = [
      { label: "Home", href: "/" },
      { label: "All years", href: "/year" },
      { label: `${year}`, href: `/year/${year}` },
    ];

    if (item.data) {
      links.push({
        label: item.data.name,
        href: `/year/${item.data.eurovisionYearYear}/${item.data.id}`,
      });
    }

    return <LinkBreadcrumbs my="md" links={links} />;
  }, [item.data, year]);

  return (
    <StandardLayout title="Year item">
      {breadcrumbs}

      <Title mb="md">
        {year}: {item.data?.name}
      </Title>

      <Table mt="md">
        <thead>
          <tr>
            <th align="center" colSpan={1}>
              Rank
            </th>
            <th>Country</th>
            <th>Song title</th>
            <th>Artist</th>
            <th>YouTube</th>
          </tr>
        </thead>
        <tbody>
          {item.data?.items.map((i, index) => (
            <tr key={i.id}>
              <td align="center">{index + 1}</td>
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
