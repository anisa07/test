import React from "react";
import { Nav } from "../../../components/nav/Nav";

export default function Page({ post }: { post: string }) {
  return (
    <>
      <Nav />
      <p>{post}</p>
    </>
  );
}

export const getStaticProps = (id: string) => {
  return {
    post: `This is a post page with id ${id}`,
  };
};

export const getStaticPageIds = () => {
  return ["1", "2", "3"];
};
