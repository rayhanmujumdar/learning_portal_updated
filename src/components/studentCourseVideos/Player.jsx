import React from "react";
import validYoutubeUrl from "../../utils/validYoutubeUrl";

export default function Player({ url, title }) {
  const validUrl = validYoutubeUrl(url);
  return (
    <iframe
      width="100%"
      height="515"
      src={validUrl ? url : null}
      title={title}
      frameBorder="0"
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
      allowFullScreen
    ></iframe>
  );
}
