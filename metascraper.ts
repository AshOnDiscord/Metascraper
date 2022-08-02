/**
 * @type {function(string): Promise<{ [index: string]: string | number }> | null}
 * @param {string} url
 * @returns {Promise<{ [index: string]: string | number }> | null}
 */
export default async (
  url: string
): Promise<{ [index: string]: string | number } | null> => {
  url = url.trim();
  if (!url) {
    console.log("URL is empty");
    return null;
  }

  const siteData = await fetch(url, {
    method: "GET",
    mode: "cors",
    redirect: "follow",
    referrerPolicy: "no-referrer",
  });

  if (!siteData.ok) return null;

  let data: { [index: string]: string | number } = {};

  if (siteData.headers.get("content-type")?.includes("text/html")) {
    const html: string = await siteData.text();
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, "text/html");

    data.type = "html";

    // #region data search
    const title =
      getMeta("twitter:title", doc) ||
      getMeta("og:title", doc) ||
      document.querySelector("title")?.textContent ||
      getMeta("title", doc) ||
      getMeta("dc.title", doc) ||
      getMeta("dcterms.title", doc) ||
      getMeta("application-name", doc) ||
      getMeta("citation.title", doc);

    if (title) data.title = title;

    const siteName =
      getMeta("og:site_name", doc) ||
      getMeta("application-name", doc) ||
      getMeta("citation.title", doc) ||
      getMeta("twitter:site", doc)?.replace("@", "");

    if (siteName) data.siteName = siteName;

    const description =
      getMeta("twitter:description", doc) ||
      getMeta("og:description", doc) ||
      getMeta("description", doc) ||
      getMeta("dc:description", doc) ||
      getMeta("dcterms.description", doc) ||
      getMeta("fdse-description", doc) ||
      getMeta("FSPageDescription", doc) ||
      getMeta("citation_issue", doc) ||
      getMeta("dcterms.subject", doc);

    if (description) data.description = description;

    const author =
      getMeta("twitter:creator", doc) ||
      getMeta("author", doc) ||
      getMeta("dc.creator", doc) ||
      getMeta("dcterms.creator", doc) ||
      getMeta("citation_author", doc) ||
      getMeta("creator", doc) ||
      getMeta("dc.publisher", doc) ||
      getMeta("dcterms.publisher", doc) ||
      getMeta("citation_publisher", doc);

    if (author) data.author = author;

    const image =
      getMeta("twitter:image", doc) ||
      getMeta("twitter:image:src", doc) ||
      getMeta("og:image:secure_url", doc) ||
      getMeta("og:image", doc) ||
      getMeta("og:image:url", doc);

    if (image) data.image = image;

    const imageWidth =
      getMeta("twitter:image:width", doc) || getMeta("og:image:width", doc);

    if (imageWidth) data.imageWidth = imageWidth;

    const imageHeight =
      getMeta("twitter:image:height", doc) || getMeta("og:image:height", doc);

    if (imageHeight) data.imageHeight = imageHeight;

    const imageAlt =
      getMeta("twitter:image:alt", doc) || getMeta("og:image:alt", doc);

    if (imageAlt) data.imageAlt = imageAlt;

    const video =
      getMeta("twitter:player", doc) ||
      getMeta("og:video:secure_url", doc) ||
      getMeta("og:video", doc) ||
      getMeta("og:video:url", doc);

    if (video) data.video = video;

    const videoWidth =
      getMeta("twitter:player:width", doc) ||
      getMeta("og:video:width", doc) ||
      getMeta("og:video:width", doc);

    if (videoWidth) data.videoWidth = videoWidth;

    const videoHeight =
      getMeta("twitter:player:height", doc) ||
      getMeta("og:video:height", doc) ||
      getMeta("og:video:height", doc);

    if (videoHeight) data.videoHeight = videoHeight;

    const audio =
      getMeta("og:audio:secure_url", doc) ||
      getMeta("og:audio", doc) ||
      getMeta("og:audio:url", doc);

    if (audio) data.audio = audio;

    const themeColor =
      getMeta("theme-color", doc) || getMeta("msapplication-TileColor", doc);

    if (themeColor) data.themeColor = themeColor;

    const favicon =
      doc.querySelector("link[rel='icon']")?.getAttribute("href") ||
      getMeta("msapplication-TileImage", doc) ||
      getMeta("msapplication-square70x70logo", doc) ||
      getMeta("msapplication-square150x150logo", doc) ||
      getMeta("msapplication-wide310x150logo", doc) ||
      getMeta("msapplication-square310x310logo", doc);

    if (favicon) data.favicon = favicon;

    const url =
      getMeta("twitter:url", doc) ||
      getMeta("og:url", doc) ||
      getMeta("url", doc) ||
      getMeta("dc.identifier", doc) ||
      getMeta("dcterms.identifier", doc) ||
      getMeta("citation_identifier", doc) ||
      getMeta("identifier", doc) ||
      getMeta("dc.source", doc) ||
      getMeta("dcterms.source", doc) ||
      getMeta("citation_source", doc);

    if (url) data.url = url;

    const creationDate =
      getMeta("date", doc) ||
      getMeta("dc.date.issued ", doc) ||
      getMeta("dcterms.date ", doc) ||
      getMeta("FSDateCreation ", doc) ||
      getMeta("FSDatePublish", doc) ||
      getMeta("citation_date", doc);

    if (creationDate) data.creationDate = creationDate;

    const updateDate = getMeta("dc.modified", doc);

    if (updateDate) data.updateDate = updateDate;

    // #endregion
  } else if (siteData.headers.get("content-type")?.includes("image")) {
    data.type = "image";
  } else if (siteData.headers.get("content-type")?.includes("video")) {
    data.type = "video";
  } else if (siteData.headers.get("content-type")?.includes("audio")) {
    data.type = "audio";
  } else {
    data.type = "unknown";
  }

  // console.log(data);
  return data;
};

const getMeta = (name: string, doc: Document): string | null => {
  let a = doc.querySelector(`meta[name='${name}']`);
  if (a) return a.getAttribute("content");
  a = doc.querySelector(`meta[property='${name}']`);
  if (a) return a.getAttribute("content");
  return null;
};
