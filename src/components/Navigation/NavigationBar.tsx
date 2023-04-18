import {
  createStyles,
  Header,
  Group,
  Burger,
  Container,
  rem,
  Title,
  Transition,
  Paper,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
// import { IconChevronDown } from "@tabler/icons-react";

import UserMenu from "./UserMenu";
import { useRouter } from "next/router";
import Link from "next/link";

const HEADER_HEIGHT = rem(60);

const useStyles = createStyles((theme) => ({
  root: {
    position: "relative",
    zIndex: 1,
    backgroundColor: theme.fn.variant({
      variant: "filled",
      color: "pink",
    }).background,
  },

  header: {
    borderBottom: 0,
  },

  dropdown: {
    position: "absolute",
    top: rem(60),
    left: 0,
    right: 0,
    zIndex: 0,
    borderTopRightRadius: 0,
    borderTopLeftRadius: 0,
    borderTopWidth: 0,
    overflow: "hidden",

    [theme.fn.largerThan("sm")]: {
      display: "none",
    },
  },

  inner: {
    height: rem(56),
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },

  links: {
    [theme.fn.smallerThan("sm")]: {
      display: "none",
    },
  },

  burger: {
    [theme.fn.largerThan("sm")]: {
      display: "none",
    },
  },

  link: {
    display: "block",
    lineHeight: 1,
    padding: `${rem(8)} ${rem(12)}`,
    borderRadius: theme.radius.sm,
    textDecoration: "none",
    color: theme.white,
    fontSize: theme.fontSizes.sm,
    fontWeight: 500,

    "&:hover": {
      backgroundColor: theme.fn.lighten(
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        theme.fn.variant({ variant: "filled", color: "pink" }).background!,
        0.1
      ),
    },
  },

  dropdownLink: {
    display: "block",
    lineHeight: 1,
    padding: `${rem(8)} ${rem(12)}`,
    borderRadius: theme.radius.sm,
    textDecoration: "none",
    color:
      theme.colorScheme === "dark"
        ? theme.colors.dark[0]
        : theme.colors.gray[7],
    fontSize: theme.fontSizes.sm,
    fontWeight: 500,

    "&:hover": {
      backgroundColor:
        theme.colorScheme === "dark"
          ? theme.colors.dark[6]
          : theme.colors.gray[0],
    },

    [theme.fn.smallerThan("sm")]: {
      borderRadius: 0,
      padding: theme.spacing.md,
    },
  },

  linkLabel: {
    marginRight: rem(5),
  },

  linkActive: {
    "&, &:hover": {
      backgroundColor: theme.fn.variant({
        variant: "light",
        color: "pink",
      }).background,
      color: theme.fn.variant({ variant: "light", color: "pink" }).color,
    },
  },

  dropdownLinkActive: {
    "&, &:hover": {
      backgroundColor: theme.fn.variant({
        variant: "light",
        color: theme.primaryColor,
      }).background,
      color: theme.fn.variant({ variant: "light", color: theme.primaryColor })
        .color,
    },
  },

  title: {
    color: theme.colorScheme == "light" ? "white" : "black",
    fontStyle: "normal",
    transition: "ease 0.25s",
    "&:hover": {
      color: theme.colors.gray[3],
    },
  },
}));

interface LinkItem {
  link: string;
  label: string;
  links?: LinkItem[];
}

const links: LinkItem[] = [{ label: "Home", link: "/" }];

export default function NavigationBar() {
  const [opened, { toggle, close }] = useDisclosure(false);
  const { classes, cx } = useStyles();
  const router = useRouter();

  const isCurrentLink = (link: LinkItem, path: string) => {
    if (link.link == "/" && path == "/") return true;
    if (link.link !== "/" && path.startsWith(link.link)) return true;
    return false;
  };

  const items = links.map((link) => (
    <Link
      key={link.label}
      href={link.link}
      className={cx(classes.link, {
        [classes.linkActive]: isCurrentLink(link, router.pathname),
      })}
      onClick={() => {
        close();
      }}
    >
      {link.label}
    </Link>
  ));

  return (
    <Header height={HEADER_HEIGHT} mb={25} className={classes.root}>
      <Container className={classes.header}>
        <div className={classes.inner}>
          <Title className={classes.title}>Eurovision Scoreboard</Title>
          <Group spacing={5} className={classes.links}>
            {items}

            <UserMenu />
          </Group>

          <Burger
            opened={opened}
            onClick={toggle}
            className={classes.burger}
            size="sm"
          />

          <Transition
            transition="pop-top-right"
            duration={200}
            mounted={opened}
          >
            {(styles) => (
              <Paper className={classes.dropdown} withBorder style={styles}>
                {items}
              </Paper>
            )}
          </Transition>
        </div>
      </Container>
    </Header>
  );
}
