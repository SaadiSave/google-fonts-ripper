// deno-lint-ignore no-explicit-any
function assertNotNullOrUndef(...x: any[]) {
  for (const param of x) {
    if (param === undefined || param === null) {
      throw new TypeError("Cannot be null or undefined");
    }
  }
}

const headers = new Headers({
  "Accept":
    "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
  "User-Agent": "AppleWebKit/537.36 (KHTML, like Gecko) Chrome/48.0.2564.116",
});

export class FontFace {
  readonly family: string;
  readonly url: string;
  readonly italic: boolean;
  readonly weight: number;
  readonly script: string;

  static fromCssDecl = (fontFaceDecl: string): FontFace => {
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
    return `${this.family.replace(/ /g, "")}${
      this.italic ? "Italic" : ""
    }${this.weight}${this.script}.woff2`;
  }

  async fetchFont(): Promise<Blob> {
    const response = (typeof window !== "undefined")
      ? await fetch(this.url)
      : await fetch(this.url, { headers: headers });

    return response.blob();
  }
}

export async function fetchCss(url: string | URL | Request): Promise<string> {
  const raw = (typeof window !== "undefined")
    ? await fetch(url)
    : await fetch(url, { headers: headers });
  return await raw.text();
}
