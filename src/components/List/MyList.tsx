import {
  Paper,
  Stack,
  UnstyledButton,
  createPolymorphicComponent,
  type UnstyledButtonProps,
  Box,
  type PaperProps,
} from "@mantine/core";
import { IconChevronRight } from "@tabler/icons-react";
import React, { forwardRef } from "react";

interface MyListProps {
  children: React.ReactNode;
}

export default function MyList({ children }: MyListProps) {
  return (
    <Paper
      p="md"
      shadow="md"
      radius="md"
      withBorder
      style={{ userSelect: "none" }}
    >
      <Stack>{children}</Stack>
    </Paper>
  );
}

// const Item = (props: UnstyledButtonProps) => (
const Item = forwardRef<HTMLButtonElement, UnstyledButtonProps>(
  ({ children, ...others }, ref) => (
    <UnstyledButton ref={ref} {...others}>
      <Paper
        p="xs"
        radius="sm"
        shadow="md"
        withBorder
        sx={{
          display: "flex",
          alignItems: "center",
        }}
      >
        {children}
      </Paper>
    </UnstyledButton>
  )
);
Item.displayName = "MyList.Item";

const Chevron = ({
  ml = true,
  className,
}: {
  ml?: boolean;
  className?: string;
}) => (
  <Box
    style={{
      display: "flex",
      alignItems: "center",
      marginLeft: ml ? "auto" : undefined,
    }}
    className={className}
  >
    <IconChevronRight size="2rem" color="gray" />
  </Box>
);

MyList.Item = createPolymorphicComponent<"button", UnstyledButtonProps>(Item);

MyList.Chevron = Chevron;

// MyList.displayName = "MYList!";

export const MyListWithRef = forwardRef<HTMLDivElement, PaperProps>(
  ({ children, ...others }, ref) => (
    <Paper
      p="md"
      shadow="md"
      radius="md"
      withBorder
      style={{ userSelect: "none" }}
      ref={ref}
      {...others}
    >
      <Stack>{children}</Stack>
    </Paper>
  )
);
MyListWithRef.displayName = "MyList";
