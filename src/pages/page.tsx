import React from "react";
import { Nav } from "../components/nav/Nav";

export default function Page() {
  return (
    <>
      <Nav />
      <h1>Hello from React! {typeof window}</h1>
    </>
  );
}

export const getStaticProps = () => {
  return {
    test: "this is test static props",
  };
};
