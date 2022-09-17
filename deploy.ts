import { serve } from "https://deno.land/std@0.156.0/http/server.ts";
import { fetchCss, FontFace } from "./common.ts";
import JSZip from "https://esm.sh/jszip@3.10.1";

async function main(req: Request): Promise<Blob> {
  const url = new URL(req.url);

  const css = await fetchCss(
    req.url.replace(url.origin, "https://fonts.googleapis.com"),
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

  return zipFile.generateAsync({ type: "blob" });
}

serve(async (req) => {
  return new Response(await main(req), {
    headers: {
      "Content-Type": "application/zip",
    },
  });
});
