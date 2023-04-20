import axios from "axios";
import { type iTunesSearchResponse } from "~/types/iTunesSearchResponse";

const iTunesSearch = "https://itunes.apple.com/search";

export const fetchiTunesData = ({
  title,
  artist,
}: {
  title: string;
  artist: string;
}) =>
  axios.get<iTunesSearchResponse>(iTunesSearch, {
    params: {
      media: "music",
      entity: "musicTrack",
      term: `${artist} - ${title}`,
    },
  });
