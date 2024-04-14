import express from "express";
import fs from "fs";
import path from "path";
import { Root } from "react-dom/client";
import { convertTsxToJsx } from "tsx-to-jsx";

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
      paths.push(itemPath.replace("src/pages/", ""));
    }
  });

  return paths;
}

const pages = traverseFolder("src/pages", []);
// const pages = fs.readdirSync(path.join(process.cwd(), "src/pages"));

app.get("*", async (req, res) => {
  // console.log(req.protocol + "://" + req.get("host") + req.originalUrl);
  console.log(
    "pageIndex",
    req.originalUrl,
    req.originalUrl === "/",
    path.join(process.cwd(), "dist/pages", "/page.html")
  );
  if (req.originalUrl === "/") {
    return res.sendFile(path.join(process.cwd(), "dist/pages", "/page.html"));
  }
  if (req.originalUrl === "/bundle.js") {
    return res.sendFile(path.join(process.cwd(), "dist/pages", "/bundle.js"));
  }
  const pageIndex = pages.indexOf(`${req.originalUrl}/`);
  console.log("pageIndex", pageIndex);
  if (pageIndex !== -1) {
    return res.sendFile(
      path.join(process.cwd(), "dist/pages", `${req.originalUrl}/page.html`)
    );
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
  // Static generation
  // for (const page of pages) {
  const fullPath = createDistFolders(pages[2]);
  const tsxPage = await import(`./pages/${pages[2]}`);

  console.log(tsxPage);
  const Page = tsxPage.default;

  fs.writeFileSync(
    path.join(process.cwd(), "src/app.tsx"),
    `
  import React from "react";
  import { createRoot } from "react-dom/client";
  import Page from "./pages/${pages[2].replace(".tsx", "")}";

  createRoot(document.getElementById("root")!).render(
    <React.StrictMode>
      <Page/>
    </React.StrictMode>);
  `
  );

  require("child_process").execSync(
    `esbuild src/app.tsx --bundle --outfile=dist/pages${fullPath.replace("page.tsx", "bundle.js")} --loader:.js=jsx`
  );

  let outputHtml: string | Root = "";
  let data = {};
  if (tsxPage.getStaticProps) {
    data = await tsxPage.getStaticProps();
    // outputHtml = renderToStaticMarkup(<Page {...data} />);
  } else {
    // outputHtml = renderToStaticMarkup(<Page />);
  }
  // outputHtml = renderToStaticMarkup(<Page {...data} />);

  // outputHtml = hydrateApp(<Page {...data} />);

  //  Page.tsx -> Page.js
  // add scritpt with Page.js in scripts

  // JSON.stringify(data)

  outputHtml = `<!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>React App</title>
    </head>
    <body>
        <div id="root"></div>

        <script crossorigin src="https://unpkg.com/react@18/umd/react.production.min.js"></script>
        <script crossorigin src="https://unpkg.com/react-dom@18/umd/react-dom.production.min.js"></script>
        <script type="text/javascript" src="https://unpkg.com/babel-standalone@6/babel.js"></script>
        <script type="text/javascript" src="bundle.js"></script>
    </body>
    </html>
    `;
  // ReactDOM.createRoot(document.getElementById('root')).render(<Page/>);

  if (typeof outputHtml === "string") {
    fs.writeFileSync(
      path.join(
        process.cwd(),
        `dist/pages${fullPath.replace(".tsx", ".html")}`
      ),
      outputHtml
    );
  }
  // }

  console.log(`Server is running on http://localhost:${port}`);
});
