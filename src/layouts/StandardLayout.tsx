import { NextSeo } from "next-seo";
import NavigationBar from "~/components/Navigation/NavigationBar";
import Container from "@mui/material/Container";
import Box from "@mui/material/Box";

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

      <main>
        <Container>
          <Box sx={{ my: 2 }}>{children}</Box>
        </Container>
      </main>
    </>
  );
}
