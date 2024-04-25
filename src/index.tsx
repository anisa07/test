import express from "express";
import path from "path";
import "dotenv/config";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import {
  buildPageJsBundle,
  copyFileFromFolderToFolder,
  createDistFolder,
  createDistFolders,
  createFolderIfNotExist,
  createHtmlPage,
  createReactPageEntryPoint,
  deleteReactPageEntryPoint,
  findLayout,
  removeFolderAndItsContent,
  traverseFolder,
} from "./utils/utils";
import { staticTemplate } from "./templates/static-template";

const app = express();
const port = process.env.SERVER_PORT;

let pages: string[] = [];
const bracketsRegex = new RegExp(/\[\w+\]/);
const distPages: Record<string, string> = {};
const distBundles: Record<string, string> = {};

app.get("*", async (req, res) => {
  const bundle = distBundles[req.originalUrl];
  const page = distPages[req.originalUrl];

  if (page) {
    return res.sendFile(path.join(process.cwd(), "dist/pages", page));
  }

  if (bundle) {
    return res.sendFile(path.join(process.cwd(), "dist/pages", bundle));
  }
});

const createStaticPage = async (
  page: string,
  tsxPage: Record<string, any>,
  pages: string[],
  pageId?: string
) => {
  let Layout: any = null;
  const Page = tsxPage.default;
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
  let data: Record<string, any> | null = null;

  if (tsxPage.getStaticProps) {
    data = await tsxPage.getStaticProps(pageId);
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

  distPages[pathWithoutExtension || "/"] = `${pathWithoutExtension}/page.html`;

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
};

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

    if (bracketsRegex.test(page)) {
      const pageIds = tsxPage.getStaticPageIds() || [];
      for (const pageId of pageIds) {
        const genPagePath = page
          .replace(bracketsRegex, pageId)
          .replace("/page.tsx", "");

        createFolderIfNotExist(`src/pages/${genPagePath}`);

        copyFileFromFolderToFolder(
          `src/pages/${page}`,
          `src/pages/${genPagePath}/page.tsx`
        );

        await createStaticPage(
          `${genPagePath}/page.tsx`,
          tsxPage,
          pages,
          pageId
        );

        removeFolderAndItsContent(`src/pages/${genPagePath}`);
      }
    } else {
      await createStaticPage(page, tsxPage, pages);
    }
  }

  console.log(`Server is running on http//localhost:${port}`);
});
