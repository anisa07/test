import React from "react";
import { Link } from "../link/Link";

export const Nav = () => {
  return (
    <div style={{ display: "flex" }}>
      <Link path="/" label="Home" />
      <Link path="/about" label="About" />
      <Link path="/about/test" label="Test" />
      <Link path="/about/test/super" label="Super" />
      <Link path="/posts/1" label="Post 1" />
      <Link path="/posts/2" label="Post 2" />
      <Link path="/posts/3" label="Post 3" />
    </div>
  );
};
