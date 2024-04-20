import React, { ReactElement } from "react";

export default function Layout({ children }: { children: ReactElement }) {
  return (
    <div
      style={{
        background: "red",
      }}
    >
      {children}
    </div>
  );
}
