import { Button } from "@mantine/core";
import { signIn } from "next-auth/react";
import { useState } from "react";
import { type Provider, colors, icons } from "~/utils/auth/authPage";

export default function SignInButton({ provider }: { provider: Provider }) {
  const [loading, setLoading] = useState(false);
  const IconComp = icons[provider.id];

  const onPress = () => {
    setLoading(true);
    void signIn(provider.id);
  };

  return (
    <Button
      leftIcon={IconComp ? <IconComp size="1.5rem" /> : undefined}
      onClick={onPress}
      color={colors[provider.id] || undefined}
      loading={loading}
      size="md"
    >
      {provider.name}
    </Button>
  );
}
