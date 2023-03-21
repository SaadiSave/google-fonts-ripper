# Google Fonts Ripper

Downloads woff files and required css from google fonts

## Website

Go to
[https://saadisave.github.io/google-fonts-ripper](https://saadisave.github.io/google-fonts-ripper)
and enter the google fonts query. Then, click the download button. The font
bundle (css + woff) is downloaded as `fonts.zip`.

## Web API

Just take any google fonts request, e.g.
`https://fonts.googleapis.com/css2?family=JetBrains+Mono` and replace the
`https://fonts.googleapis.com` part by `https://google-fonts-ripper.deno.dev`.
The server will respond with a zip file containing the `woff2` files and a
`fonts.css` file that you can import in css.

DO NOT USE THE SERVER IN PRODUCTION, AS IT IS SUBJECT TO BREAKING CHANGES
WITHOUT ANY WARNING WHATSOEVER. DOWNLOAD THE ZIP AND USE ITS CONTENTS IN
PRODUCTION INSTEAD.

### Example

```sh
curl "https://google-fonts-ripper/css2?family=JetBrains+Mono" --output fonts.zip
```

## CLI

### Install Deno (skip if already installed)

[Deno - Installation](https://deno.land/#installation)

### Run

Run the script with the google fonts query as the first argument. The `woff2`
files and `fonts.css` are written to a directory called `fonts`.

```sh
deno run --allow-net --allow-write main.ts https://fonts.googleapis.com/css2?family=JetBrains+Mono
```
