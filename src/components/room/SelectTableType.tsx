import React from "react";
import styled from "styled-components";

import { TableType } from "./types";

const StyledSelect = styled.select`
  position: relative;
  z-index: 1;

  &:focus {
    z-index: 10;
  }
`;

interface SelectTableTypeProps {
  tableType: TableType;
  setTableType: (type: TableType) => void;
}

export const SelectTableType: React.FC<SelectTableTypeProps> = ({
  tableType,
  setTableType,
}) => {
  return (
    <StyledSelect
      className="select select-bordered select-sm"
      value={tableType}
      onChange={(e) => setTableType(e.target.value as TableType)}
    >
      <option value={TableType.poker}>Poker</option>
      <option value={TableType.blackjack}>Blackjack</option>
      <option value={TableType.craps}>Craps</option>
      <option value={TableType.roulette}>Roulette Right</option>
      <option value={TableType.rouletteL}>Roulette Left</option>
      {/* <option value={TableType.slot}>Slot</option>
      <option value={TableType.other}>Other</option> */}
    </StyledSelect>
  );
};
