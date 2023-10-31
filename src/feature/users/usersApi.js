import { apiSlice } from "../api/apiSlice";
import { assignmentMarkApi } from "../assignmentMark/assignmentMarkApi";
import { addToLeaderboard, addMyRank } from "../leaderboard/leaderboardSlice";
import { quizMarkApi } from "../quizMark/quizMarkAPi";
export const usersApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getUser: builder.query({
      query: (email) => `/auth/users?email=${email}`,
    }),
    getUsers: builder.query({
      query: () => `/auth/users`,
      providesTags: ["leaderboard"],
      async onQueryStarted(_, { dispatch, queryFulfilled, getState }) {
        try {
          const { data: users } = await queryFulfilled;
          const authUser = getState().auth.user;
          const usersResult = [];
          for (const user of users) {
            if (user.role !== "admin") {
              const { data: quizMark } = await dispatch(
                quizMarkApi.endpoints.getQuizMark.initiate(user?._id)
              );
              const { data: assignmentMark } = await dispatch(
                assignmentMarkApi.endpoints.getAssignmentMark.initiate(user?._id)
              );
              let totalQuizMark = 0;
              let totalAssignmentMark = 0;
              if (quizMark.length > 0) {
                totalQuizMark = quizMark.reduce((acc, cur) => {
                  acc = acc + Number(cur.mark);
                  return acc;
                }, 0);
              }
              if (assignmentMark.length > 0) {
                totalAssignmentMark = assignmentMark.reduce((acc, cur) => {
                  acc = acc + Number(cur.mark);
                  return acc;
                }, 0);
              }
              const totalMark = totalAssignmentMark + totalQuizMark;
              const userMark = {
                id: user._id,
                name: user.name,
                totalQuizMark,
                totalAssignmentMark,
                totalMark,
              };
              usersResult.push(userMark);
            }
          }
          let rank = 1;
          const sortedUser = usersResult
            .sort((a, b) => b.totalMark - a.totalMark)
            .map((item, index) => {
              const { totalMark } = item;
              if (index > 0 && totalMark < usersResult[index - 1].totalMark) {
                rank = rank + 1;
              }
              return {
                ...item,
                rank,
              };
            });
          dispatch(addToLeaderboard(sortedUser));
          dispatch(addMyRank(authUser?._id));
        } catch (err) {}
      },
    }),
  }),
});

export const { useGetUsersQuery } = usersApi;
