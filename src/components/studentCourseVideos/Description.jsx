import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useGetVideoQuery } from "../../feature/videos/videosApi";
import { useParams } from "react-router-dom";
import Loading from "../ui/loader/Loading";
import Error from "../ui/error/Error";
import { format } from "date-fns";
import Player from "./Player";
import { useGetRelatedQuizQuery } from "../../feature/quizzes/quizApi";
import { clearQuizState } from "../../feature/quizzes/quizSlice";
import { useGetQuizMarkQuery } from "../../feature/quizMark/quizMarkAPi";
import { selectAuthUser } from "../../feature/auth/authSelector";
import { useGetAssignmentMarkQuery } from "../../feature/assignmentMark/assignmentMarkApi";
import { useDispatch, useSelector } from "react-redux";
import { useGetAssignmentQuery } from "../../feature/assignments/assignmentsApi";
import AssignmentSubmitForm from "../form/AssignmentSubmitForm";
import Modal from "../Modal/Modal";

export default function Description() {
  const user = useSelector(selectAuthUser) || {};
  const { videoId = null } = useParams();
  const dispatch = useDispatch();
  const [modalOpen, setModalOpen] = useState();
  const { data: video, isLoading, isError } = useGetVideoQuery(videoId);
  const { data: relatedQuiz } = useGetRelatedQuizQuery(videoId);
  const { data: assignment, isSuccess: isSuccessAssignment } =
    useGetAssignmentQuery(videoId);
  const { data: userSubmittedAssignment } = useGetAssignmentMarkQuery(
    user?._id
  );
  const { _id, title, description, url, createdAt } = video || {};
  const { data: userSubmittedQuiz } = useGetQuizMarkQuery(user?._id);
  const videoSubmittedQuiz = userSubmittedQuiz?.find(
    (quiz) => quiz.video_id === videoId
  );
  const videoSubmittedAssignment = userSubmittedAssignment?.find(
    (submittedAssignment) => {
      if (assignment?._id) {
        return submittedAssignment.assignment_id === assignment._id;
      }
    }
  );
  useEffect(() => {
    dispatch(clearQuizState());
  }, [dispatch]);
  let content = null;
  let modal = null;
  if (isLoading) {
    return <Loading></Loading>;
  }
  if (!isLoading && isError) {
    return <Error message={"There was an error"}></Error>;
  }
  if (isSuccessAssignment) {
    modal = (
      <Modal open={modalOpen}>
        <AssignmentSubmitForm
          control={setModalOpen}
          assignment={assignment}
          videoTitle={title}
          videoId={_id}
        ></AssignmentSubmitForm>
      </Modal>
    );
  }
  if (isLoading) {
    return <Loading></Loading>;
  } else if (!isLoading && isError) {
    return <Error message="There was an error"></Error>;
  } else if (!isLoading && !isError && video?._id) {
    const date = createdAt?.split("T")[0];
    const dateFormat = format(new Date(date), "d MMMM yyyy");
    content = (
      <div className="col-span-full w-full space-y-8 lg:col-span-2">
        <Player url={url} title={title}></Player>
        {modal}
        <div>
          <h1 className="text-lg font-semibold tracking-tight text-slate-100">
            {title}
          </h1>
          <h2 className=" pb-4 text-sm leading-[1.7142857] text-slate-400">
            Uploaded on {dateFormat}
          </h2>
          <div className="flex gap-4">
            {assignment?._id && !videoSubmittedAssignment?._id && (
              <button
                onClick={() => setModalOpen(true)}
                className="px-3 font-bold py-1 border border-cyan text-cyan rounded-full text-sm hover:bg-cyan hover:text-primary"
              >
                এসাইনমেন্ট
              </button>
            )}
            {videoSubmittedAssignment?._id && (
              <p className="px-3 font-bold py-1 border border-gray-500 text-gray-500 rounded-full text-sm ">
                এসাইনমেন্ট submitted
              </p>
            )}
            {relatedQuiz?.length > 0 && !videoSubmittedQuiz?._id && (
              <Link
                to={`/student/Quiz/${videoId}`}
                className="px-3 font-bold py-1 border border-cyan text-cyan rounded-full text-sm hover:bg-cyan hover:text-primary"
              >
                কুইজে অংশগ্রহণ করুন
              </Link>
            )}
            {videoSubmittedQuiz?._id && (
              <p className="px-3 font-bold py-1 border border-gray-500 text-gray-500 rounded-full text-sm ">
                কুইজ submitted
              </p>
            )}
          </div>
          <p className="mt-4 text-sm text-slate-400 leading-6">{description}</p>
        </div>
      </div>
    );
  }
  return content;
}
