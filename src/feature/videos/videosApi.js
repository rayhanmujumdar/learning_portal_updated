import { apiSlice } from "../api/apiSlice";
import { assignmentApi } from "../assignments/assignmentsApi";
import { quizApi } from "../quizzes/quizApi";
export const videosApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getVideos: builder.query({
      query: () => `/videos`,
      async onQueryStarted(_, { queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          if (data.length > 0 && !!localStorage.getItem("videoId")) {
            localStorage.setItem("videoId", data[0]?._id);
          }
        } catch (err) {}
      },
    }),
    getVideo: builder.query({
      query: (id) => `/videos/${id}`,
    }),
    // admin can access mutation api in this below
    addVideo: builder.mutation({
      query: (data) => ({
        url: `/videos`,
        method: "POST",
        body: data,
      }),
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        try {
          const { data: video } = await queryFulfilled;
          dispatch(
            apiSlice.util.updateQueryData("getVideos", undefined, (draft) => {
              draft.push(video);
            })
          );
        } catch (err) {}
      },
    }),
    editVideo: builder.mutation({
      query: ({ id, data }) => ({
        url: `/videos/${id}`,
        method: "PATCH",
        body: data,
      }),
      async onQueryStarted({ id, data }, { dispatch, queryFulfilled }) {
        const optimisticEdit = dispatch(
          apiSlice.util.updateQueryData("getVideos", undefined, (draft) => {
            const videoIndex = draft.findIndex((video) => video._id === id);
            draft[videoIndex] = { _id: id, ...data };
          })
        );
        try {
          await queryFulfilled;
        } catch (err) {
          optimisticEdit.undo();
        }
      },
    }),
    deleteVideo: builder.mutation({
      query: (id) => ({
        url: `/videos/${id}`,
        method: "DELETE",
      }),
      async onQueryStarted(id, { dispatch, queryFulfilled }) {
        const optimisticDelete = dispatch(
          apiSlice.util.updateQueryData("getVideos", undefined, (draft) => {
            return draft.filter((video) => video?._id !== id);
          })
        );
        try {
          await queryFulfilled;
          const { data: relatedAssignments = [] } =
            (await dispatch(
              assignmentApi.endpoints.getAssignment.initiate(id)
            )) || {};
          const { data: relatedQuizzes = [] } =
            (await dispatch(quizApi.endpoints.getRelatedQuiz.initiate(id))) ||
            {};
          relatedAssignments?.forEach(async (assignment) => {
            await dispatch(
              assignmentApi.endpoints.deleteAssignment.initiate(assignment._id)
            );
            dispatch(
              apiSlice.util.updateQueryData(
                "getAssignments",
                undefined,
                (draft) => {
                  return draft.filter(
                    (existingAssignment) =>
                      existingAssignment._id !== assignment._id
                  );
                }
              )
            );
          });
          relatedQuizzes?.forEach(async (quiz) => {
            await dispatch(quizApi.endpoints.deleteQuiz.initiate(quiz._id));
            dispatch(
              apiSlice.util.updateQueryData(
                "getQuizzes",
                undefined,
                (draft) => {
                  return draft.filter(
                    (existingQuiz) => existingQuiz._id !== quiz._id
                  );
                }
              )
            );
          });
        } catch (err) {
          optimisticDelete.undo();
        }
      },
    }),
  }),
});

export const {
  useGetVideosQuery,
  useGetVideoQuery,
  useAddVideoMutation,
  useEditVideoMutation,
  useDeleteVideoMutation,
} = videosApi;
