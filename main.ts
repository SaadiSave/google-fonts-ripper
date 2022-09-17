import {
  bold,
  cyan,
  green,
  yellow,
} from "https://deno.land/std@0.156.0/fmt/colors.ts";

import { fetchCss, FontFace } from "./common.ts";

declare global {
  interface String {
    colour(fn: (arg0: string) => string): string;
    heavy(): string;
  }
}

String.prototype.colour = function (fn) {
  return fn(this as string);
};

String.prototype.heavy = function () {
  return bold(this as string);
};

try {
  Deno.mkdirSync("fonts");
} catch (e) {
  if (e.code !== "EEXIST") {
    throw e;
  }
}

const prefix = "fonts";

if (Deno.args.length < 1) Deno.exit(1);

const css = await fetchCss(new URL(Deno.args.at(0)!));

console.log("Received this css:".colour(green).heavy());
console.log(css.colour(yellow));

const fontFaceRegex = /(\/\*.*\*\/\s@font-face {[^}]*})/g;

const fonts = [];

for (const face of css.matchAll(fontFaceRegex)) {
  const fontFaceDecl = face.pop()!;
  console.log("Parsing this @font-face declaration:".colour(green).heavy());
  console.log(fontFaceDecl.colour(yellow));

  const parsed = FontFace.fromCssDecl(fontFaceDecl);
  console.log("Parsing successful:".colour(cyan));
  console.log(parsed);
  fonts.push(parsed);
}

const out = fonts.reduce(
  (acc, font) => acc.replace(font.url, `./${font.fileName}`),
  css,
);

fonts.map((font) => {
  return { fileName: font.fileName, blob: font.fetchFont() };
}).map(async ({ fileName, blob }) => {
  const blobResolved = await blob;
  const arr = new Uint8Array(await blobResolved.arrayBuffer());
  await Deno.writeFile(`${prefix}/${fileName}`, arr, { create: true });
});

Deno.writeTextFileSync(`${prefix}/fonts.css`, out, { create: true });
