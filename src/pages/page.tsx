import React from "react";
import { Nav } from "../components/nav/Nav";

export default function Page({ test }: { test: string }) {
  return (
    <>
      <Nav />
      <h1>Hello from React! {test}</h1>
    </>
  );
}

export const getStaticProps = () => {
  return {
    test: "this is test static props",
  };
};
