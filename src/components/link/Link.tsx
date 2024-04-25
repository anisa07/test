import React from "react";
import { getHostUrl } from "../../app-helpers/app-helpers";

interface LinkProps {
  path: string;
  label: string;
}

export const Link = ({ path, label }: LinkProps) => {
  const handleClick = () => {
    console.log("test geturl", `${getHostUrl()}${path}`);
  };

  return (
    <a
      href={`${getHostUrl()}${path}`}
      style={{
        background: "none",
        color: "inherit",
        border: "none",
        // padding: 0,
        font: "inherit",
        cursor: "pointer",
        outline: "inherit",
        padding: "10px",
      }}
      onClick={handleClick}
    >
      {label}
    </a>
  );
};
