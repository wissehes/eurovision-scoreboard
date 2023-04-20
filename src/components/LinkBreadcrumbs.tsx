import { Anchor, Breadcrumbs, type BreadcrumbsProps } from "@mantine/core";
import Link from "next/link";

export interface Link {
  label: string;
  href: string;
}

interface LinkBreadcrumbProps extends Omit<BreadcrumbsProps, "children"> {
  links: Link[];
}

export const crumbs = {
  adminPage: { label: "Admin", href: "/admin" },
  adminYears: { label: "Years", href: "/admin/year" },

  homePage: { label: "Home", href: "/" },
};

export default function LinkBreadcrumbs({
  links,
  ...props
}: LinkBreadcrumbProps) {
  return (
    <Breadcrumbs {...props}>
      {links.map((l) => (
        <Anchor key={l.href} href={l.href} component={Link}>
          {l.label}
        </Anchor>
      ))}
    </Breadcrumbs>
  );
}
