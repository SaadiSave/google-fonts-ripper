/// <reference lib="dom" />

import { fetchCss, FontFace } from "./common.js";
import JSZip from "https://esm.sh/jszip@3.10.1";

function download(content: Blob, name: string) {
  const url = URL.createObjectURL(content);

  const link = document.createElement("a");
  link.href = url;
  link.download = name;

  document.body.appendChild(link);

  link.dispatchEvent(
    new MouseEvent("click", {
      bubbles: true,
      cancelable: true,
      view: window,
    }),
  );

  document.body.removeChild(link);
}

async function main() {
  const query = document.getElementById("req")! as HTMLInputElement;
  const url = new URL(query.value);

  const css = await fetchCss(
    query.value.replace(url.origin, "https://fonts.googleapis.com"),
  );

  const fontFaceRegex = /(\/\*.*\*\/\s@font-face {[^}]*})/g;

  const fonts = [];

  for (const face of css.matchAll(fontFaceRegex)) {
    fonts.push(FontFace.fromCssDecl(face.pop()!));
  }

  const outputCss = fonts.reduce(
    (acc, font) => acc.replace(font.url, `./${font.fileName}`),
    css,
  );

  const blobs = fonts.map((font) => {
    return { fileName: font.fileName, blob: font.fetchFont() };
  });

  const zipFile = new JSZip();
  const dir = zipFile.folder("fonts");

  dir?.file("fonts.css", outputCss);

  const promises = blobs.map(async ({ fileName, blob }) => {
    dir?.file(fileName, await blob);
  });

  await Promise.all(promises);

  const blob = await zipFile.generateAsync({ type: "blob" });

  download(blob, "fonts.zip");
}

const btn = document.getElementById("download") as HTMLButtonElement;
btn.onclick = main;
