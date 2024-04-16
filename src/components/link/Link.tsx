import React from "react";

interface LinkProps {
  path: string;
  label: string;
}

const state = {};

const hasWindow = () => typeof window !== "undefined";

export const Link = ({ path, label }: LinkProps) => {
  const url = new URL(
    (hasWindow() ? window.location.origin : "http://localhost:3000") + path
  );

  const handleClick = () => {
    console.log("test");
    // history.pushState(state, "", url);
  };

  return (
    <a
      href={`http://localhost:3000${path}`}
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
