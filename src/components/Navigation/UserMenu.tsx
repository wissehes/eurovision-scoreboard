import {
  Group,
  Loader,
  Menu,
  Text,
  UnstyledButton,
  createStyles,
  rem,
  useMantineTheme,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { signIn, signOut, useSession } from "next-auth/react";
import Link from "next/link";
import ProfileAvatar from "../ProfileAvatar";
import {
  type Icon,
  IconChevronDown,
  IconLogout,
  IconUser,
  // IconDashboard,
  IconCalendar,
  IconWorld,
  IconMusic,
  IconUsers,
} from "@tabler/icons-react";

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

interface DropdownLink {
  label: string;
  href: string;
  Icon?: Icon;
}

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
        <UserSection />
        <Menu.Divider />
        {session?.user.role == "ADMIN" && <AdminSection />}

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

function UserSection() {
  const theme = useMantineTheme();
  return (
    <>
      <Menu.Label>My account</Menu.Label>
      <Menu.Item
        component={Link}
        href="/user/me"
        icon={
          <IconUser size="0.9rem" color={theme.colors.blue[6]} stroke={1.5} />
        }
      >
        My Account
      </Menu.Item>
    </>
  );
}

const adminItems: DropdownLink[] = [
  // { label: "Admin page", href: "/admin", Icon: IconDashboard },
  { label: "Users", href: "/admin/users", Icon: IconUsers },
  { label: "Years", href: "/admin/year", Icon: IconCalendar },
  { label: "Countries", href: "/admin/countries", Icon: IconWorld },
  { label: "Songs", href: "/admin/songs", Icon: IconMusic },
];

function AdminSection() {
  const theme = useMantineTheme();
  return (
    <>
      <Menu.Label>Admin section</Menu.Label>
      {adminItems.map((i) => (
        <Menu.Item
          key={i.href}
          component={Link}
          href={i.href}
          icon={
            i.Icon ? (
              <i.Icon size="0.9rem" color={theme.colors.blue[6]} stroke={1.5} />
            ) : undefined
          }
        >
          {i.label}
        </Menu.Item>
      ))}
      <Menu.Divider />
    </>
  );
}
