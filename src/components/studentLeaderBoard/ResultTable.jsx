import React, { useEffect } from "react";
import { usersApi } from "../../feature/users/usersApi";
import TableHead from "./TableHead";
import TableRow from "./TableRow";
import { useDispatch, useSelector } from "react-redux";
import { selectLeaderBoard } from "../../feature/leaderboard/leaderboardSelector";
export default function resultTable() {
  const dispatch = useDispatch();
  useEffect(() => {
    dispatch(usersApi.endpoints.getUsers.initiate());
  }, [dispatch]);
  const leaderBoard = useSelector(selectLeaderBoard);
  return (
    <table className="text-base w-full border border-slate-600/50 rounded-md my-4">
      <TableHead></TableHead>
      <tbody>
        {leaderBoard?.slice(0, 20).map((result) => (
          <TableRow key={result?.id} result={result}></TableRow>
        ))}
      </tbody>
    </table>
  );
}
