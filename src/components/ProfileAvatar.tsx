import { Avatar, type AvatarProps } from "@mantine/core";
import { useSession } from "next-auth/react";

export default function ProfileAvatar(props: AvatarProps) {
  const { data: session } = useSession();

  const initials = session?.user.name
    ?.split(" ")
    .map((a) => a.split("")[0]?.toUpperCase())
    .join("");

  if (session?.user.image) {
    return (
      <Avatar
        src={session.user.image}
        alt={`${session?.user.name ?? "A user"}'s profile picture`}
        {...props}
      />
    );
  } else if (initials) {
    return <Avatar {...props}>{initials}</Avatar>;
  } else {
    return <Avatar {...props} />;
  }
}
