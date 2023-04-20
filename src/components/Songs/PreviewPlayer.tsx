import { ActionIcon, type ActionIconProps } from "@mantine/core";
import {
  IconPlayerPauseFilled,
  IconPlayerPlayFilled,
} from "@tabler/icons-react";
import { useEffect, useRef, useState } from "react";

interface PreviewPlayerProps extends Omit<ActionIconProps, "children"> {
  previewURL?: string;
}

export default function PreviewPlayer({
  previewURL,
  ...props
}: PreviewPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const audio = useRef(new Audio());

  const play = () => {
    if (!previewURL) return;
    if (!audio.current.src) {
      audio.current.src = previewURL;
    }
    void audio.current.play();
    setIsPlaying(true);
  };

  const pause = () => {
    audio.current.pause();
    setIsPlaying(false);
  };

  useEffect(() => {
    const player = audio.current;
    player.addEventListener("pause", () => setIsPlaying(false));
    player.addEventListener("play", () => setIsPlaying(true));
    return () => {
      player.pause();
      player.remove();
    };
  }, []);

  return (
    <ActionIcon
      disabled={!previewURL}
      onClick={() => (isPlaying ? pause() : play())}
      {...props}
    >
      {isPlaying ? <IconPlayerPauseFilled /> : <IconPlayerPlayFilled />}
    </ActionIcon>
  );
}
