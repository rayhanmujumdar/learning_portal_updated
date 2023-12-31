import React, { useEffect } from "react";
import Video from "./Video";
import { useGetVideosQuery } from "../../feature/videos/videosApi";
import Error from "../ui/error/Error";
import Loading from "../ui/loader/Loading";
// import { useNavigate } from "react-router-dom";

export default function VideoList() {
  const { data: videos, isLoading, isError } = useGetVideosQuery();
  let content = null;
  if (isLoading) {
    content = <Loading></Loading>;
  }
  if (!isLoading && isError) {
    content = <Error message={`There was an error`}></Error>;
  }
  if (!isLoading && !isError && videos.length === 0) {
    content = <Error message={`Content Not Found`}></Error>;
  }
  if (!isLoading && !isError && videos.length > 0) {
    content = videos.map((video) => (
      <Video key={video._id} video={video}></Video>
    ));
  }
  return (
    <div className="col-span-full lg:col-auto max-h-[570px] overflow-y-auto bg-secondary p-4 rounded-md border border-slate-50/10 divide-y divide-slate-600/30">
      {content}
    </div>
  );
}
