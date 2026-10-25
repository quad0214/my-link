export function faviconSources(value: string): string[] {
  try {
    const url = new URL(value);
    if (url.protocol !== "https:" && url.protocol !== "http:") return [];
    return [
      new URL("/favicon.ico", url.origin).href,
      "https://www.google.com/s2/favicons?domain_url=" + encodeURIComponent(url.origin) + "&sz=64",
    ];
  } catch { return []; }
}
