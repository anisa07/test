import React from "react";
import { Nav } from "../components/nav/Nav";

export default function Page({ test }: { test: string }) {
  return (
    <>
      <Nav />
      <h1>Hello from React! {test}</h1>
      <img
        width={300}
        height={300}
        src="/resources/0eb5f41d-584b-4776-8748-512714a071ae.jpeg"
        alt="food"
      />
    </>
  );
}

export const getStaticProps = () => {
  return {
    test: "this is test static props",
  };
};
