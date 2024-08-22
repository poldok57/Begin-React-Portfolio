// import React, { useState } from "react";
import { Button } from "@/components/atom/Button";
import { GroupCreat } from "./GroupCreat";
// import { TableData } from "./types";
// import { PokerTable } from "./PokerTable";

export const RoomCreat = () => {
  return (
    <div
      className="flex w-full bg-background"
      style={{ height: "calc(100vh - 70px)" }}
    >
      <GroupCreat />
      <h1>RoomCreate</h1>
      <Button>Add table</Button>
    </div>
  );
};
