import { Button } from "@mantine/core";
import { signIn } from "next-auth/react";
import { type Provider, colors, icons } from "~/utils/auth/authPage";

export default function SignInButton({ provider }: { provider: Provider }) {
  const IconComp = icons[provider.id];

  return (
    <Button
      leftIcon={IconComp ? <IconComp size="1.5rem" /> : undefined}
      onClick={() => void signIn(provider.id)}
      color={colors[provider.id] || undefined}
      size="md"
    >
      {provider.name}
    </Button>
  );
}
