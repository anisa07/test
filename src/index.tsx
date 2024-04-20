import express from "express";
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
  findLayout,
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

    if (page.includes("layout.tsx")) {
      continue;
    }

    let tsxPage: Record<string, any> = {};

    if (page.includes("page.tsx")) {
      tsxPage = await import(`./pages/${page}`);
    }

    const Page = tsxPage.default;
    let Layout: any = null;
    const fullPath = createDistFolders(page);
    const pathWithoutExtension = fullPath
      .replace("/", "")
      .replace("/page.tsx", "");

    const layoutPath = findLayout(`${pathWithoutExtension}/layout.tsx`, pages);

    if (layoutPath) {
      const tsxLayout = await import(`./pages/${layoutPath}`);
      Layout = tsxLayout.default;
    }

    // create static and dynamic page content
    let staticPage: string = "";
    let dynamicPage = Layout ? "<Layout><Page /></Layout>" : "<Page />";
    let data: any;

    if (tsxPage.getStaticProps) {
      data = await tsxPage.getStaticProps();
      staticPage = Layout
        ? renderToStaticMarkup(
            <Layout>
              <Page {...data} />
            </Layout>
          )
        : renderToStaticMarkup(<Page {...data} />);
    } else {
      staticPage = Layout
        ? renderToStaticMarkup(
            <Layout>
              <Page />
            </Layout>
          )
        : renderToStaticMarkup(<Page />);
    }

    if (data) {
      dynamicPage = Layout
        ? "<Layout><Page {..." + JSON.stringify(data) + "} /></Layout>"
        : "<Page {..." + JSON.stringify(data) + "} />";
    }

    createReactPageEntryPoint(fullPath, dynamicPage, layoutPath);

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

    // delete helper page after build app.tsx
    deleteReactPageEntryPoint();
  }

  console.log(`Server is running on http://localhost:${port}`);
});
