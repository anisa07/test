import React from "react";
import { Link } from "../link/Link";

export const Nav = () => {
  return (
    <div style={{ display: "flex" }}>
      <Link path="/" label="Home" />
      <Link path="/about" label="About" />
      <Link path="/about/test" label="Test" />
      <Link path="/about/test/super" label="Super" />
    </div>
  );
};
