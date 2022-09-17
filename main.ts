import {
  bold,
  cyan,
  green,
  yellow,
} from "https://deno.land/std@0.155.0/fmt/colors.ts";

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

// deno-lint-ignore no-explicit-any
const assertNotNullOrUndef = (...x: any[]) => {
  for (const param of x) {
    if (param === undefined || param === null) {
      throw new TypeError("Cannot be null or undefined");
    }
  }
};

const headers = new Headers({
  "Accept":
    "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
  "User-Agent": "AppleWebKit/537.36 (KHTML, like Gecko) Chrome/48.0.2564.116",
});

class FontFace {
  readonly family: string;
  readonly url: string;
  readonly italic: boolean;
  readonly weight: number;
  readonly script: string;

  static fromCssDecl = (fontFaceDecl: string): FontFace => {
    console.log("Parsing this @font-face declaration:".colour(green).heavy());
    console.log(fontFaceDecl.colour(yellow));

    const scriptRegex = /\/\*\s([^\s]*)\s\*\//g;
    const urlRegex = /src:\s*url\(([^\(]*)\)/g;
    const familyRegex = /font-family:\s*'(.*)'/g;
    const styleRegex = /font-style:\s*(\w+)/g;
    const weightRegex = /font-weight:\s*(\d+)/g;

    const script = scriptRegex.exec(fontFaceDecl)?.pop();
    const url = urlRegex.exec(fontFaceDecl)?.pop();
    const family = familyRegex.exec(fontFaceDecl)?.pop();
    const style = styleRegex.exec(fontFaceDecl)?.pop();
    const weight = weightRegex.exec(fontFaceDecl)?.pop();

    assertNotNullOrUndef(family, style, weight, url, script);

    const ret = new FontFace(
      family!,
      url!,
      style === "italic",
      parseInt(weight!),
      script!,
    );

    console.log("Parsing successful:".colour(cyan));
    console.log(ret);

    return ret;
  };

  constructor(
    family: string,
    url: string,
    italic: boolean,
    weight: number,
    script: string,
  ) {
    this.family = family;
    this.url = url;
    this.italic = italic;
    this.weight = weight;
    this.script = script;
  }

  get fileName(): string {
    return `${this.family.replaceAll(" ", "")}${
      this.italic ? "Italic" : ""
    }${this.weight}${this.script}.woff2`;
  }

  async fetchFont(): Promise<Blob> {
    const response = await fetch(new URL(this.url), {
      headers: headers,
    });

    return response.blob();
  }
}

async function fetchCss(url: string | URL | Request): Promise<string> {
  const raw = await fetch(url, { headers: headers });
  return await raw.text();
}

if (Deno.args.length < 1) Deno.exit(1);

const css = await fetchCss(new URL(Deno.args.at(0)!));

console.log("Received this css:".colour(green).heavy());
console.log(css.colour(yellow));

const fontFaceRegex = /(\/\*.*\*\/\s@font-face {[^}]*})/g;

const fonts = [];

for (const face of css.matchAll(fontFaceRegex)) {
  fonts.push(FontFace.fromCssDecl(face.pop()!));
}

const out = fonts.reduce(
  (acc, font) => acc.replace(font.url, `./${font.fileName}`),
  css,
);

fonts.map((font) => {
  return { font: font, blob: font.fetchFont() };
}).map(async ({ font, blob }) => {
  const blobResolved = await blob;
  const arr = new Uint8Array(await blobResolved.arrayBuffer());
  await Deno.writeFile(`${prefix}/${font.fileName}`, arr, { create: true });
});

Deno.writeTextFileSync(`${prefix}/fonts.css`, out, { create: true });
