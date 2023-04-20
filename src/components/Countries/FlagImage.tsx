import { Image, type ImageProps } from "@mantine/core";

interface FlagImageProps extends Omit<ImageProps, "children"> {
  code: string;
}

export default function FlagImage({ code, ...props }: FlagImageProps) {
  return (
    <Image
      src={`https://flagcdn.com/${code.toLowerCase()}.svg`}
      alt={`Flag for ${code}`}
      radius={5}
      withPlaceholder
      {...props}
      //   radius="xs"
      //   style={{ boxShadow: "1px 1px 1px black" }}
    />
  );
}
