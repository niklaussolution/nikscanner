// Known link-shortener hosts. A shortener link hides its real destination, so the pipeline
// skips heuristic-scoring the shortener URL itself (there's nothing meaningful to analyze yet)
// and instead relies on the redirect chain to reach the real target.
const SHORTENER_HOSTS = [
  "bit.ly",
  "tinyurl.com",
  "t.co",
  "goo.gl",
  "ow.ly",
  "is.gd",
  "buff.ly",
  "adf.ly",
  "rebrand.ly",
  "cutt.ly",
  "shorturl.at",
  "tiny.cc",
  "rb.gy",
  "v.gd",
  "t.ly",
  "soo.gd",
  "s.id",
  "qr.ae",
  "u.to",
  "lnk.to",
  "bl.ink",
];

export function isShortenerHost(hostname: string): boolean {
  const host = hostname.trim().toLowerCase();
  return SHORTENER_HOSTS.some((s) => host === s || host.endsWith(`.${s}`));
}
