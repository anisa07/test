import express from "express";
import fs from "fs";
import path from "path";
import React from "react";
import { JSX } from "react";
import { Root } from "react-dom/client";
import { renderToStaticMarkup } from "react-dom/server";
// import { Root } from "react-dom/client";
// import { convertTsxToJsx } from "tsx-to-jsx";

const app = express();
const port = 3000;

/**
 * Recursively traverse a folder and accumulate paths.
 * @param {string} folderPath - Path of the folder to traverse.
 * @param {string[]} paths - Array to accumulate paths.
 * @returns {string[]} - Array of accumulated paths.
 */
function traverseFolder(folderPath: string, paths: string[]) {
  const items = fs.readdirSync(folderPath);

  items.forEach((item) => {
    const itemPath = path.join(folderPath, item);
    if (fs.statSync(itemPath).isDirectory()) {
      traverseFolder(itemPath, paths);
    } else {
      paths.push(
        itemPath.replace(
          folderPath.includes("src/pages") ? "src/pages" : "dist/pages",
          ""
        )
      );
    }
  });

  return paths;
}

let pages: string[] = [];
const distPages: Map<string, string> = new Map();
const distBundles: Map<string, string> = new Map();
// const pages = fs.readdirSync(path.join(process.cwd(), "src/pages"));

app.get("*", async (req, res) => {
  // console.log(req.protocol + "://" + req.get("host") + req.originalUrl);
  const bundle = distBundles.get(req.originalUrl);
  const page = distPages.get(req.originalUrl);
  if (page) {
    return res.sendFile(path.join(process.cwd(), "dist/pages", page));
  }
  if (bundle) {
    return res.sendFile(path.join(process.cwd(), "dist/pages", bundle));
  }
  // const page = pages[0];
  // const mod = await import(`./pages/${page}`);
  // const Page = mod.default;
  // const { pipe } = renderToPipeableStream(<Page />);
  // pipe(res);
});

const createDistFolder = () => {
  if (!fs.existsSync("dist")) {
    fs.mkdirSync("dist");
  }
  if (!fs.existsSync("dist/pages")) {
    fs.mkdirSync("dist/pages");
  }
};

const createDistFolders = (page: string) => {
  const pagePathStruct = page.split("/");
  let fullPath = "";
  for (const p of pagePathStruct) {
    fullPath += `/${p}`;
    if (p !== "page.tsx" && !fs.existsSync(`dist/pages${fullPath}`)) {
      fs.mkdirSync(`dist/pages${fullPath}`);
    }
  }
  return fullPath;
};

app.listen(port, async () => {
  createDistFolder();
  pages = traverseFolder("src/pages", []);
  // Static generation
  for (let index = 0; index < pages.length; index++) {
    // distPages
    const page = pages[index];
    const fullPath = createDistFolders(page);
    const pathWithout = fullPath.replace("/", "").replace("/page.tsx", "");
    // console.log(pathWithout);
    const tsxPage = await import(`./pages/${page}`);
    const Page = tsxPage.default;
    let staticPage: string = "";
    let data: any;
    if (tsxPage.getStaticProps) {
      data = await tsxPage.getStaticProps();
      staticPage = renderToStaticMarkup(<Page {...data} />);
      // outputHtml = renderToStaticMarkup(<Page {...data} />);
    } else {
      // outputHtml = renderToStaticMarkup(<Page />);
      staticPage = renderToStaticMarkup(<Page />);
    }

    // console.log(tsxPage);

    let pageInMarkup = "<Page />";
    if (data) {
      pageInMarkup = "<Page {..." + JSON.stringify(data) + "} />";
    }

    fs.writeFileSync(
      path.join(process.cwd(), "src/app.tsx"),
      `
    import React from "react";
    import { createRoot } from "react-dom/client";
    import Page from "./pages${fullPath.replace(".tsx", "")}";
    createRoot(document.getElementById("root")!).render(
      <React.StrictMode>
        ${pageInMarkup}
      </React.StrictMode>);
    `
    );

    const bundleName = `bundle-${index}.js`;
    require("child_process").execSync(
      `esbuild src/app.tsx --bundle --outfile=dist/pages${fullPath.replace("page.tsx", bundleName)} --loader:.js=jsx`
    );
    distPages.set(pathWithout || "/", `${pathWithout}/page.html`);
    if (pathWithout.indexOf("/") !== pathWithout.lastIndexOf("/")) {
      const subPath = pathWithout.substring(0, pathWithout.lastIndexOf("/"));
      distBundles.set(
        `${subPath}/${bundleName}`,
        `${pathWithout}/${bundleName}`
      );
    } else {
      distBundles.set(`/${bundleName}`, `${pathWithout}/${bundleName}`);
    }
    let outputHtml: string | Root = "";

    // if (tsxPage.getStaticProps) {
    //   data = await tsxPage.getStaticProps();
    //   console.log(renderToStaticMarkup(<Page {...data} />));
    //   // outputHtml = renderToStaticMarkup(<Page {...data} />);
    // } else {
    //   // outputHtml = renderToStaticMarkup(<Page />);
    // }
    //   // outputHtml = renderToStaticMarkup(<Page {...data} />);
    //   // outputHtml = hydrateApp(<Page {...data} />);
    //   //  Page.tsx -> Page.js
    //   // add scritpt with Page.js in scripts
    //   JSON.stringify(data)

    outputHtml = `<!DOCTYPE html>
      <html lang="en">
      <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>React App</title>
      </head>
      <body>
          <div id="root">
            ${staticPage}
          </div>
          <script crossorigin src="https://unpkg.com/react@18/umd/react.production.min.js"></script>
          <script crossorigin src="https://unpkg.com/react-dom@18/umd/react-dom.production.min.js"></script>
          <script type="text/javascript" src="https://unpkg.com/babel-standalone@6/babel.js"></script>
          <script type="text/javascript" src="${bundleName}"></script>
      </body>
      </html>
      `;

    if (typeof outputHtml === "string") {
      fs.writeFileSync(
        path.join(
          process.cwd(),
          `dist/pages${fullPath.replace(".tsx", ".html")}`
        ),
        outputHtml
      );
    }
  }

  // distPages = traverseFolder("dist/pages", []);
  console.log(`Server is running on http://localhost:${port}`);
});
