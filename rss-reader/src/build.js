/**
 * 🦉 Bubo RSS Reader
 * ====
 * Dead, dead simple feed reader that renders an HTML
 * page with links to content from feeds organized by site
 *
 */

import Parser from 'rss-parser';
import { resolve } from 'node:path';
import { writeFileSync } from 'node:fs';
import { template } from './template.js';

const OUTFILE_PATH = './output/index.html';
const CONTENT_TYPES = [
  'application/json',
  'application/atom+xml',
  'application/rss+xml',
  'application/xml',
  'application/octet-stream',
  'text/xml'
];

await build();

async function build() {
  const feeds = {
    "feeds": [
      "https://hnrss.org/frontpage?points=10&comments=5&count=35"
    ],
    "blogs": [
      "https://xeiaso.net/blog.rss",
      "https://drewdevault.com/blog/index.xml",
      "https://danluu.com/atom.xml",
      "https://kevinfiol.com/atom.xml",
      "https://terrysfreegameoftheweek.com/feed/",
      "https://fasterthanli.me/index.xml"
    ]
  };

  let allItems = [];
  const parser = new Parser();
  const errors = [];
  const groupContents = {};

  for (const groupName in feeds) {
    groupContents[groupName] = [];

    const results = await Promise.allSettled(
      Object.values(feeds[groupName]).map(url =>
        fetch(url, { method: 'GET' })
          .then(res => [url, res])
          .catch(e => {
            throw [url, e];
          })
      )
    );

    for (const result of results) {
      if (result.status === 'rejected') {
        const [url, error] = result.reason;
        errors.push(url);
        console.error(`Error fetching ${url}:\n`, error);
        continue;
      }

      const [url, response] = result.value;

      try {
        // e.g., `application/xml; charset=utf-8` -> `application/xml`
        const contentType = response.headers.get('content-type').split(';')[0];

        if (!CONTENT_TYPES.includes(contentType))
          throw Error(`Feed at ${url} has invalid content-type.`)

        const body = await response.text();
        const contents = typeof body === 'string'
          ? await parser.parseString(body)
          : body;

        if (!contents.items.length === 0)
          throw Error(`Feed at ${url} contains no items.`)

        contents.feed = url;
        contents.title = contents.title || contents.link;
        groupContents[groupName].push(contents);

        // item sort & normalization
        contents.items.sort(byDateSort);
        contents.items.forEach((item) => {
          // 1. try to normalize date attribute naming
          const dateAttr = item.pubDate || item.isoDate || item.date || item.published;
          item.timestamp = new Date(dateAttr).toLocaleDateString();

          // 2. correct link url if it lacks the hostname
          if (item.link && item.link.split('http').length === 1) {
            item.link =
              // if the hostname ends with a /, and the item link begins with a /
              contents.link.slice(-1) === '/' && item.link.slice(0, 1) === '/'
                ? contents.link + item.link.slice(1)
                : contents.link + item.link;
          }

          // 3. escape html in titles
          item.title = escapeHtml(item.title);
        });

        // add to allItems
        allItems = [...allItems, ...contents.items];
      } catch (e) {
        console.error(e);
        errors.push(url)
      }
    }
  }

  const groups = Object.entries(groupContents);

  // for each group, sort the feeds
  // sort the feeds by comparing the isoDate of the first items of each feed
  groups.forEach(([_groupName, feeds]) => {
    feeds.sort((a, b) => byDateSort(a.items[0], b.items[0]));
  });

  // sort `all articles` view
  allItems.sort((a, b) => byDateSort(a, b));

  const now = new Date();
  const html = template({ allItems, groups, now, errors });

  writeFileSync(resolve(OUTFILE_PATH), html, { encoding: 'utf8' });
  console.log(`Reader built successfully at: ${OUTFILE_PATH}`);
}

/**
 * utils
 */
function parseDate(item) {
  let date = item
    ? (item.isoDate || item.pubDate)
    : undefined;

  return date ? new Date(date) : undefined;
}

function byDateSort(dateStrA, dateStrB) {
  const [aDate, bDate] = [parseDate(dateStrA), parseDate(dateStrB)];
  if (!aDate || !bDate) return 0;
  return bDate - aDate;
}

function escapeHtml(html) {
  return html.replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('\'', '&apos;')
    .replaceAll('"', '&quot;');
}
