import { apiSlice } from "../api/apiSlice";
export const assignmentApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getAssignments: builder.query({
      query: () => `/assignment`,
    }),
    getAssignment: builder.query({
      query: (id) => `/assignment?videoId=${id}`,
    }),
    getAssignmentWithId: builder.query({
      query: (id) => `/assignment/${id}`,
    }),
    addAssignment: builder.mutation({
      query: (data) => ({
        url: "/assignment",
        method: "POST",
        body: data,
      }),
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          dispatch(
            apiSlice.util.updateQueryData(
              "getAssignments",
              undefined,
              (draft) => {
                draft.push(data);
              }
            )
          );
        } catch (err) {}
      },
    }),
    addSubmitted: builder.mutation({
      query: ({ id, data }) => ({
        url: `/assignment/${id}`,
        method: "PATCH",
        body: data,
      }),
      async onQueryStarted({ videoId }, { queryFulfilled, dispatch }) {
        try {
          await queryFulfilled;
          dispatch(
            apiSlice.util.updateQueryData(
              "getAssignment",
              videoId.toString(),
              (draft) => {
                const index = draft.findIndex(
                  (assignment) => assignment.video_id === videoId
                );
                draft[index].isSubmit = true;
              }
            )
          );
        } catch (err) {}
      },
    }),
    editAssignment: builder.mutation({
      query: ({ id, data }) => ({
        url: `/assignment/${id}`,
        method: "PATCH",
        body: data,
      }),
      async onQueryStarted({ id, data }, { queryFulfilled, dispatch }) {
        const optimisticEdit = dispatch(
          apiSlice.util.updateQueryData(
            "getAssignments",
            undefined,
            (draft) => {
              const assignmentIndex = draft.findIndex(
                (assignment) => assignment._id == id
              );
              draft[assignmentIndex] = { _id: id, ...data };
            }
          )
        );
        try {
          await queryFulfilled;
        } catch (err) {
          optimisticEdit.undo();
        }
      },
    }),
    deleteAssignment: builder.mutation({
      query: (id) => ({
        url: `/assignment/${id}`,
        method: "DELETE",
      }),
      async onQueryStarted(id, { queryFulfilled, dispatch }) {
        const optimisticDelete = dispatch(
          apiSlice.util.updateQueryData(
            "getAssignments",
            undefined,
            (draft) => {
              const remainingAssignment = draft.filter(
                (assignment) => assignment._id != id
              );
              return remainingAssignment;
            }
          )
        );
        try {
          await queryFulfilled;
        } catch (err) {
          optimisticDelete.undo();
        }
      },
    }),
  }),
});

export const {
  useGetAssignmentsQuery,
  useGetAssignmentQuery,
  useAddSubmittedMutation,
  useAddAssignmentMutation,
  useDeleteAssignmentMutation,
  useEditAssignmentMutation,
  useGetAssignmentWithIdQuery,
} = assignmentApi;
