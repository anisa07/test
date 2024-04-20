import express from "express";
import fs from "fs";
import path from "path";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import {
  buildPageJsBundle,
  createDistFolder,
  createDistFolders,
  createHtmlPage,
  createReactPageEntryPoint,
  deleteReactPageEntryPoint,
  traverseFolder,
} from "./utils/utils";
import { staticTemplate } from "./templates/static-template";

const app = express();
const port = 3000;

let pages: string[] = [];
const distPages: Record<string, string> = {};
const distBundles: Record<string, string> = {};

app.get("*", async (req, res) => {
  // console.log("req.originalUrl", req.originalUrl);
  // console.log("distPages", distPages);
  // console.log("distBundles", distBundles);
  const bundle = distBundles[req.originalUrl];
  const page = distPages[req.originalUrl];
  // console.log("bundle", bundle);
  // console.log("page", page);

  if (page) {
    return res.sendFile(path.join(process.cwd(), "dist/pages", page));
  }

  if (bundle) {
    return res.sendFile(path.join(process.cwd(), "dist/pages", bundle));
  }

  // const pagesKeys = Object.keys(distPages);
  // console.log('pagesKeys', pagesKeys)
  // const splitUrl = req.originalUrl.split("/")
  // for (const pageKey of pagesKeys) {
  //   if (pageKey.includes("[")) {
  //     const splitPageKey = pageKey.split("/")
  //     // req.originalUrl

  //   }
  // }
  // how to solve dynamic urls
});

app.listen(port, async () => {
  createDistFolder();
  pages = traverseFolder("src/pages", []);

  for (let index = 0; index < pages.length; index++) {
    const page = pages[index];
    const tsxPage = await import(`./pages/${page}`);
    const Page = tsxPage.default;
    const fullPath = createDistFolders(page);
    const pathWithoutExtension = fullPath
      .replace("/", "")
      .replace("/page.tsx", "");

    // create static and dynamic page content
    let staticPage: string = "";
    let dynamicPage = "<Page />";
    let data: any;

    if (tsxPage.getStaticProps) {
      data = await tsxPage.getStaticProps();
      staticPage = renderToStaticMarkup(<Page {...data} />);
    } else {
      staticPage = renderToStaticMarkup(<Page />);
    }

    if (data) {
      dynamicPage = "<Page {..." + JSON.stringify(data) + "} />";
    }

    createReactPageEntryPoint(fullPath, dynamicPage);

    // create js bundle for dynamic page
    const bundleName = `bundle.js`;
    buildPageJsBundle(fullPath, bundleName);

    distPages[pathWithoutExtension || "/"] =
      `${pathWithoutExtension}/page.html`;

    distBundles[`${pathWithoutExtension}/${bundleName}`] =
      `${pathWithoutExtension}/${bundleName}`;

    const outputHtml = staticTemplate(
      staticPage,
      `${pathWithoutExtension}/${bundleName}`
    );

    if (typeof outputHtml === "string") {
      createHtmlPage(fullPath, outputHtml);
    }

    // delete app.tsx
    deleteReactPageEntryPoint();
  }

  console.log(`Server is running on http://localhost:${port}`);
});
