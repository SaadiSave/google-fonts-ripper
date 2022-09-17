import { serve } from "https://deno.land/std@0.156.0/http/server.ts";
import {
  BlobReader,
  BlobWriter,
  configure,
  TextReader,
  ZipWriter,
} from "https://deno.land/x/zipjs@v2.6.27/index.js";
import { fetchCss, FontFace } from "./common.ts";

configure({
  maxWorkers: 1,
});

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

  const zipFileWriter = new BlobWriter();
  const zipWriter = new ZipWriter(zipFileWriter);

  await zipWriter.add("fonts.css", new TextReader(outputCss));

  const promises = blobs.map(async ({ fileName, blob }) => {
    await zipWriter.add(fileName, new BlobReader(await blob));
  });

  await Promise.all(promises);

  await zipWriter.close();

  return await zipFileWriter.getData();
}

serve(async (req) => {
  return new Response(await main(req), {
    headers: {
      "Content-Type": "application/zip",
    },
  });
});
