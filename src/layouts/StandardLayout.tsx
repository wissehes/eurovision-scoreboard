import { NextSeo } from "next-seo";
import NavigationBar from "~/components/Navigation/NavigationBar";
import { Container } from "@mantine/core";

export default function StandardLayout({
  title,
  children,
}: {
  title: string;
  children?: JSX.Element | JSX.Element[] | string | undefined;
}) {
  return (
    <>
      <NextSeo title={title} />
      <NavigationBar />

      <main style={{ paddingBottom: "3rem" }}>
        <Container>
          {/* <Box sx={{ my: 2 }}>{children}</Box> */}
          {children}
        </Container>
      </main>
    </>
  );
}
