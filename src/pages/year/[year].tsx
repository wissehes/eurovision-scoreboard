import { Loader, Text, Title } from "@mantine/core";
import Link from "next/link";
import { useRouter } from "next/router";
import { useMemo } from "react";
import LinkBreadcrumbs from "~/components/LinkBreadcrumbs";
import MyList from "~/components/List/MyList";
import StandardLayout from "~/layouts/StandardLayout";
import { api } from "~/utils/api";

export default function YearPage() {
  const router = useRouter();

  const year = api.years.get.useQuery(
    {
      year: Number(router.query.year as string),
    },
    { enabled: !!router.query.year && !Number.isNaN(router.query.year) }
  );

  const breadcrumbs = useMemo(() => {
    const links: { label: string; href: string }[] = [
      { label: "Home", href: "/" },
      { label: "All years", href: "/year" },
    ];

    if (year.data) {
      links.push({
        label: year.data?.year.toString(),
        href: `/year/${year.data?.year}`,
      });
    }

    return <LinkBreadcrumbs my="md" links={links} />;
  }, [year.data]);

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

      <Title mb="md">{year.data.year}</Title>

      <MyList>
        {year.data?.items.map((i) => (
          <MyList.Item
            key={i.id}
            component={Link}
            href={`/year/${i.yearId}/${i.id}`}
          >
            <Title order={2} style={{ padding: "1rem" }}>
              {i.name}
            </Title>

            <Text color="dimmed" sx={{ marginLeft: "auto" }} mr="md">
              {i.items.length} Songs
            </Text>

            <MyList.Chevron ml={false} />
          </MyList.Item>
        ))}
      </MyList>

      {/* <Table striped highlightOnHover>
        <thead>
          <tr>
            <th>Name</th>
            <th># of songs</th>
            <th align="right">Actions</th>
          </tr>
        </thead>
        <tbody>{rows}</tbody>
      </Table> */}
    </StandardLayout>
  );
}
