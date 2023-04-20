import { Image, type ImageProps } from "@mantine/core";

interface FlagAvatarProps extends Omit<ImageProps, "children"> {
  code: string;
}

export default function FlagAvatar({ code, ...props }: FlagAvatarProps) {
  return (
    <Image
      src={`https://flagcdn.com/${code.toLowerCase()}.svg`}
      alt={`Flag for ${code}`}
      maw={45}
      ml="sm"
      radius={5}
      withPlaceholder
      {...props}
      //   radius="xs"
      //   style={{ boxShadow: "1px 1px 1px black" }}
    />
  );
}
