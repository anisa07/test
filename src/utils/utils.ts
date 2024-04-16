import fs from "fs";
import path from "path";
import { dynamicTemplate } from "../templates/dynamic-template";

/**
 * Recursively traverse a folder and accumulate paths.
 * @param {string} folderPath - Path of the folder to traverse.
 * @param {string[]} paths - Array to accumulate paths.
 * @returns {string[]} - Array of accumulated paths.
 */
export function traverseFolder(folderPath: string, paths: string[]) {
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

/**
 * Create main output folder and first pages folder
 */
export const createDistFolder = () => {
  if (!fs.existsSync("dist")) {
    fs.mkdirSync("dist");
  }
  if (!fs.existsSync("dist/pages")) {
    fs.mkdirSync("dist/pages");
  }
};

/**
 * Create output page subfolder structure
 * @param {string} pagePath - Path of the page.
 * @returns {string} - full output page path.
 */
export const createDistFolders = (pagePath: string) => {
  const pagePathStruct = pagePath.split("/");
  let fullPath = "";
  for (const p of pagePathStruct) {
    fullPath += `/${p}`;
    if (p !== "page.tsx" && !fs.existsSync(`dist/pages${fullPath}`)) {
      fs.mkdirSync(`dist/pages${fullPath}`);
    }
  }
  return fullPath;
};

/**
 * Create HTML page
 * @param {string} pagePath - Path of the page in pages structure.
 * @param {string} outputHtml - HTML of the page.
 */
export const createHtmlPage = (pagePath: string, outputHtml: string) => {
  fs.writeFileSync(
    path.join(process.cwd(), `dist/pages${pagePath.replace(".tsx", ".html")}`),
    outputHtml
  );
};

/**
 * Create dynamic page script
 * @param {string} pagePath - Path of the page in pages structure.
 * @param {string} bundleName - Bundle name.
 */
export const buildPageJsBundle = (pagePath: string, bundleName: string) => {
  require("child_process").execSync(
    `esbuild src/utils/app.tsx --bundle --outfile=dist/pages${pagePath.replace("page.tsx", bundleName)} --loader:.js=jsx`
  );
};

/**
 * Create React dynamic page entry point
 * @param {string} pagePath - Path of the page in pages structure.
 * @param {string} dynamicPageMarkup - Dynamic page template.
 */
export const createReactPageEntryPoint = (
  pagePath: string,
  dynamicPageMarkup: string
) => {
  fs.writeFileSync(
    path.join(process.cwd(), "src/utils/app.tsx"),
    dynamicTemplate(pagePath.replace("/", ""), dynamicPageMarkup)
  );
};

/**
 * Delete React dynamic page entry point
 */
export const deleteReactPageEntryPoint = () => {
  fs.unlinkSync("src/utils/app.tsx");
};