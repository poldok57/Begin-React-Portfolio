// import React, { useState } from "react";
import { Button } from "@/components/atom/Button";
import Image from "next/image";
import { GroupCreat } from "./GroupCreat";
import SettingsOff from "@/components/atom/svg/SettingsOff";
// import { TableData } from "./types";
// import { PokerTable } from "./PokerTable";

export const RoomCreat = () => {
  return (
    <div
      className="flex w-full bg-background"
      style={{ height: "calc(100vh - 70px)" }}
    >
      <div className="flex flex-row w-full">
        <GroupCreat />
        <div className="flex flex-col gap-2 p-2">
          <h1>RoomCreate</h1>
          <Button>Add table</Button>

          <Image
            src="/svg/settings.svg"
            alt="settings"
            width={100}
            height={100}
          />
          <SettingsOff size={100} />
          <Image
            src="/svg/circle-off.svg"
            alt="settings"
            width={100}
            height={100}
          />
        </div>
      </div>
    </div>
  );
};
