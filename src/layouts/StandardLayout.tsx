import { NextSeo } from "next-seo";
import NavigationBar from "~/components/Navigation/NavigationBar";
import { Container } from "@mantine/core";
import React from "react";

export default function StandardLayout({
  title,
  children,
  description,
}: {
  title: string;
  description?: string;
  // children?: JSX.Element | JSX.Element[] | string | undefined;
  children: React.ReactNode | React.ReactNode[];
}) {
  return (
    <>
      <NextSeo title={title} description={description} />
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
