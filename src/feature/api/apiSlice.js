import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/dist/query/react";
import { loggedOut } from "../auth/authSlice";
const baseQuery = fetchBaseQuery({
  baseUrl: "https://learning-portal-application.onrender.com/api/v1",
  prepareHeaders: async (headers, { getState }) => {
    const token = await getState().auth.accessToken;
    if (token) {
      headers.set("authorization", `Bearer ${token}`);
    }
    return headers;
  },
});

export const apiSlice = createApi({
  reducerPath: "api",
  keepUnusedDataFor: 600,
  baseQuery: async (args, api, extraOption) => {
    let result = await baseQuery(args, api, extraOption);
    if (
      result?.error &&
      (result?.error?.status === 401 || result.error.status === 403)
    ) {
      api.dispatch(loggedOut());
    }
    return result;
  },
  tagTypes: ["quizMark", "assignmentMark", "leaderboard"],
  endpoints: (builder) => ({}),
});
