import { Group, Image, Text, Title } from "@mantine/core";
import type {
  GetServerSideProps,
  InferGetServerSidePropsType,
  NextPage,
} from "next";
import { useSession } from "next-auth/react";
import dynamic from "next/dynamic";
import FlagImage from "~/components/Countries/FlagImage";
import MyList from "~/components/List/MyList";
import EditSongButton from "~/components/Songs/EditSongButton";
import StandardLayout from "~/layouts/StandardLayout";
import { prisma } from "~/server/db";

const getCountry = (id: string) =>
  prisma.country.findUnique({
    where: { id },
    include: { items: true },
  });

type Country = NonNullable<Awaited<ReturnType<typeof getCountry>>>;

export const getServerSideProps: GetServerSideProps<{
  country: Country;
}> = async (ctx) => {
  const id = ctx.params?.country;
  if (!id || Array.isArray(id)) return { notFound: true };
  const country = await getCountry(id);
  if (!country) return { notFound: true };

  return { props: { country } };
};

const PreviewPlayer = dynamic(
  () => import("~/components/Songs/PreviewPlayer"),
  {
    ssr: false,
  }
);

const CountryPage: NextPage<
  InferGetServerSidePropsType<typeof getServerSideProps>
> = ({ country }) => {
  const { data: session } = useSession();

  return (
    <StandardLayout title={country.fullname}>
      <Group mb="md">
        <FlagImage code={country.isoCode} maw={50} />

        <Title>{country.fullname}</Title>
      </Group>

      {/* <Text>Songs</Text> */}

      <MyList>
        {country.items.map((s) => (
          <MyList.ItemNoButton key={s.id}>
            <Image
              src={s.artworkURL}
              maw={50}
              mr="md"
              alt={`${s.title} artwork`}
              radius={5}
            />

            <div>
              <Text size="lg" weight="bold">
                {s.title}
              </Text>
              <Text size="md">{s.artist}</Text>
            </div>

            <div style={{ marginLeft: "auto" }}></div>

            <Group sx={{ marginRight: "1.5rem" }}>
              <PreviewPlayer
                previewURL={s.previewURL ?? undefined}
                color="pink"
              />
              {session?.user.role == "ADMIN" && (
                <EditSongButton songId={s.id} />
              )}
            </Group>
          </MyList.ItemNoButton>
        ))}
      </MyList>
    </StandardLayout>
  );
};

export default CountryPage;
