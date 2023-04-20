import {
  Group,
  Loader,
  Menu,
  Text,
  UnstyledButton,
  createStyles,
  rem,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { signIn, signOut, useSession } from "next-auth/react";
import Link from "next/link";
import ProfileAvatar from "../ProfileAvatar";
import { IconChevronDown, IconLogout } from "@tabler/icons-react";

const useStyles = createStyles((theme) => ({
  header: {
    paddingTop: theme.spacing.sm,
    backgroundColor:
      theme.colorScheme === "dark"
        ? theme.colors.dark[6]
        : theme.colors.gray[0],
    borderBottom: `${rem(1)} solid ${
      theme.colorScheme === "dark" ? "transparent" : theme.colors.gray[2]
    }`,
    marginBottom: rem(120),
  },

  mainSection: {
    paddingBottom: theme.spacing.sm,
  },

  user: {
    color: theme.colorScheme === "dark" ? theme.colors.dark[0] : theme.black,
    padding: `${theme.spacing.xs} ${theme.spacing.sm}`,
    borderRadius: theme.radius.sm,
    transition: "background-color 100ms ease",

    "&:hover": {
      backgroundColor: theme.fn.lighten(
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        theme.fn.variant({ variant: "filled", color: "pink" }).background!,
        0.1
      ),
    },

    [theme.fn.smallerThan("xs")]: {
      display: "none",
    },
  },

  burger: {
    [theme.fn.largerThan("xs")]: {
      display: "none",
    },
  },

  userActive: {
    backgroundColor: theme.fn.lighten(
      //   eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      theme.fn.variant({ variant: "filled", color: "pink" }).background!,
      0.1
    ),
  },

  tabs: {
    [theme.fn.smallerThan("sm")]: {
      display: "none",
    },
  },

  tabsList: {
    borderBottom: "0 !important",
  },

  tab: {
    fontWeight: 500,
    height: rem(38),
    backgroundColor: "transparent",

    "&:hover": {
      backgroundColor:
        theme.colorScheme === "dark"
          ? theme.colors.dark[5]
          : theme.colors.gray[1],
    },

    "&[data-active]": {
      backgroundColor:
        theme.colorScheme === "dark" ? theme.colors.dark[7] : theme.white,
      borderColor:
        theme.colorScheme === "dark"
          ? theme.colors.dark[7]
          : theme.colors.gray[2],
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

  nameText: {
    color: theme.white,
    lineHeight: 1,
  },
}));

export default function UserMenu() {
  const { classes, cx, theme } = useStyles();
  const [opened, { open, close }] = useDisclosure(false);

  const { data: session, status } = useSession();

  if (status == "unauthenticated") {
    return (
      <Link
        className={classes.link}
        onClick={(e) => {
          e.preventDefault();
          void signIn();
        }}
        href="/api/auth/signin"
      >
        Sign in
      </Link>
    );
  }

  return (
    <Menu
      width={180}
      position="bottom-end"
      transitionProps={{ transition: "pop-top-right" }}
      onClose={close}
      onOpen={open}
      withinPortal
    >
      <Menu.Target>
        <UnstyledButton
          className={cx(classes.user, { [classes.userActive]: opened })}
        >
          <Group spacing={7}>
            <ProfileAvatar size={20} radius="xl" />
            {status == "loading" && <Loader size={20} />}
            {status !== "loading" && (
              <Text weight={500} size="sm" className={classes.nameText} mr={3}>
                {session?.user.name ?? <i>No name...</i>}
              </Text>
            )}
            <IconChevronDown size={rem(12)} stroke={1.5} color="white" />
          </Group>
        </UnstyledButton>
      </Menu.Target>

      <Menu.Dropdown>
        {session?.user.role == "ADMIN" && <AdminSection />}
        <Menu.Divider />

        <Menu.Item
          icon={
            <IconLogout
              size="0.9rem"
              color={theme.colors.red[6]}
              stroke={1.5}
            />
          }
          onClick={() => void signOut()}
        >
          Sign out
        </Menu.Item>
      </Menu.Dropdown>
    </Menu>
  );
}

function AdminSection() {
  return (
    <>
      <Menu.Label>Admin section</Menu.Label>
      <Menu.Item component={Link} href="/admin/">
        Admin page
      </Menu.Item>
      <Menu.Divider />
      <Menu.Item component={Link} href="/admin/year">
        Years
      </Menu.Item>
      <Menu.Item component={Link} href="/admin/countries">
        Countries
      </Menu.Item>
      <Menu.Item component={Link} href="/admin/songs">
        Songs
      </Menu.Item>
    </>
  );
}
