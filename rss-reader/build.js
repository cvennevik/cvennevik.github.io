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
  const FEEDS = {
    "feeds": [
      "http://agileotter.blogspot.com/feeds/posts/default",
      "http://feeds.hanselman.com/ScottHanselman",
      "https://www.tbray.org/ongoing/ongoing.atom",
      "https://infrequently.org/feed/",
      "https://feedpress.me/baldurbjarnason",
      "https://danluu.com/atom.xml",
      "https://robinrendle.com/feed.xml",
      "https://charity.wtf/feed/",
      "https://lexi-lambda.github.io/feeds/all.atom.xml",
      "https://blog.codinghorror.com/rss/",
      "https://jvns.ca/atom.xml",
      "https://martinfowler.com/feed.atom",
      "https://einarwh.wordpress.com/feed/",
      "https://www.hillelwayne.com/post/index.xml",
      "https://chelseatroy.com/feed/",
      "https://www.worthe-it.co.za/atom.xml",
      "https://apenwarr.ca/log/rss.php",
      "https://dbushell.com/rss.xml",
      "https://rosswintle.uk/feed/",
      "https://gomakethings.com/feed/index.xml",
      "https://medium.com/feed/@kevlinhenney",
      "https://blog.jim-nielsen.com/feed.xml",
      "https://kyleshevlin.com/rss.xml",
      "https://niksilver.com/feed/",
      "https://codemanship.wordpress.com/feed/",
      "https://angryweasel.com/blog/feed/",
      "https://2ality.com/feeds/posts.atom",
      "https://buttondown.email/hillelwayne/rss",
      "https://adrianroselli.com/feed",
      "https://visible-quality.blogspot.com/feeds/posts/default",
      "https://www.geepawhill.org/feed/",
      "https://www.estherderby.com/feed/",
      "https://cutlefish.substack.com/feed",
      "https://heydonworks.com/feed.xml",
      "https://verraes.net/feed.atom",
      "https://marvinh.dev/feed.xml",
      "https://brooker.co.za/blog/rss.xml",
      "https://thejollyteapot.com/feed.rss",
      "https://www.kodemaker.no/atom.xml",
      "https://unremarkabletester.com/feed/",
      "https://jessitron.com/feed/",
      "https://jenniferplusplus.com/rss/",
      "https://www.felienne.com/feed",
      "https://macwright.com/rss.xml",
      "https://qristin.wordpress.com/feed/",
      "https://www.jamesshore.com/v2/feed",
      "https://sunshowers.io/index.xml",
      "https://www.davefarley.net/?feed=rss2",
      "https://www.simplermachines.com/rss/",
      "https://blog.matthewskelton.net/feed/",
      "https://dannorth.net/blog/index.xml",
      "https://artemis.sh/feed.xml",
      "https://thinkinglabs.io/feed.xml",
      "https://blog.thecodewhisperer.com/feed.xml",
      "http://feeds.feedburner.com/Spydergrrl",
      "https://www.scattered-thoughts.net/atom.xml",
      "https://tis.so/feed.rss",
      "https://borretti.me/feed.xml",
      "https://www.youtube.com/feeds/videos.xml?channel_id=UCUMwY9iS8oMyWDYIe6_RmoA",
      "https://ericwbailey.website/feed/feed.xml",
      "https://coding-is-like-cooking.info/feed/",
      "https://www.drcathicks.com/blog-feed.xml",
      "https://moonbase.lgbt/blog/atom.xml",
      "https://hollycummins.com/rss.xml",
      "https://knowler.dev/feed.xml",
      "https://hazelweakly.me/atom.xml",
      "https://www.youtube.com/feeds/videos.xml?channel_id=UCaSCt8s_4nfkRglWCvNSDrg",
      "https://angryweasel.substack.com/feed",
      "https://jakelazaroff.com/rss.xml",
      "https://www.softwaremaxims.com/feed.xml",
      "https://dragan-stepanovic.github.io/feed.xml",
      "https://www.goodtechthings.com/rss/",
      "https://newsletter.goodtechthings.com/feed",
      "https://blog.ferrata.dev/rss/",
      "https://buffadoo.nl/feed/",
      "https://stianlagstad.no/posts/index.xml",
      "https://riseandfallofdevops.com/feed",
      "https://chocolatedrivendevelopment.com/feed.xml",
      "https://nikoheikkila.fi/feed/",
      "https://blog.codemanship.dev/rss.xml",
      "https://qahiccupps.blogspot.com/feeds/posts/default",
      "https://maritvandijk.com/feed/",
      "https://testandanalysis.home.blog/feed/",
      "https://llama-the-ultimate.org/feed.xml",
      "https://brainsik.net/index.xml",
      "https://world.hey.com/niko.heikkila/feed.atom",
      "https://www.lisihocke.com/feeds/posts/default",
      "https://popup1.taymor.io/feed",
      "https://feeds.transistor.fm/oddly-influenced",
      "https://gregorriegler.com/feed.xml",
      "https://businessjournaling.substack.com/feed",
      "https://johan.hal.se/feed.xml",
      "https://medium.com/feed/@Cyrdup",
      "https://read.ceilfors.com/feed",
      "https://thathtml.blog/feed.xml",
      "https://nonlinear.garden/rss.xml",
      "https://www.cvennevik.no/blog/rss.xml",
      "https://frills.dev/all.xml",
      "https://leanrada.com/rss.xml",
      "https://havn.blog/feed.xml",
      "https://boehs.org/in/blog.xml",
      "https://uncenter.dev/feed.xml",
      "https://smallsheds.garden/blog/feed.atom",
      "https://dbushell.com/notes/rss.xml",
      "https://www.youtube.com/feeds/videos.xml?channel_id=UCgWtfN4QMkZq_zizqQh9dfw",
      "https://lalaland.mataroa.blog/rss/",
    ]
  };

  let allItems = [];
  const parser = new Parser();
  const errors = [];
  const groupContents = {};

  for (const groupName in FEEDS) {
    groupContents[groupName] = [];

    const results = await Promise.allSettled(
      Object.values(FEEDS[groupName]).map(url => {
        const start = Date.now()
        return fetch(url, { method: 'GET' })
          .then(res => {
            console.info(`Fetched ${url} in ${(Date.now() - start) / 1000}s`)
            return [url, res]
          })
          .catch(e => {
            throw [url, e];
          })
      })
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
  if (!html) return html;
  return html.replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('\'', '&apos;')
    .replaceAll('"', '&quot;');
}
