/**
 * Code based on Bubo RSS Reader, via kevinfiol, with the following license:
 * 
 * ===
 * MIT License
 * 
 * Copyright (c) 2021 George Mandis, kevinfiol
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 * 
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 * ===
 *
 */

import Parser from 'rss-parser';
import { writeFileSync } from 'node:fs';


/* Config */
const OUTFILE_PATH = './rss-reader.html';
const MAX_ITEMS_PER_FEED = 5;
const FEED_URL_GROUPS = {
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

/* Template */
function forEach(arr, fn) {
  let str = '';
  arr.forEach(i => str += fn(i) || '');
  return str;
}

function template({ groups, errors, now }) {
  return (`
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Cecilie's Feed Reader</title>
  <style>
    details + details { margin-block-start: 0.5rem; }
    summary { cursor: pointer; }
    summary:hover { opacity: .75; }
    .feed-url { color: #aaa; }
  </style>
</head>
<body>
  <h1>Cecilie's Feed Reader</h1>
  <p>
    Last updated ${now.toLocaleString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}.
  </p>

  <main>
    ${forEach(groups, ([groupName, feeds]) => `
      <h2>${groupName}</h2>

      ${forEach(feeds, feed => `
        <details>
          <summary>
            ${feed.title}
            <span class="feed-url">(${feed.feedUrl})</span>
          </summary>
          <ul>
            ${forEach(feed.items, item => `
              <li>${item.isoDate.split('T')[0]}: <a href="${item.link}">${item.title}</a></li>
            `)}
          </ul>
        </details>
      `)}
    `)}
  </main>

  <footer>
    ${errors.length > 0 ? `
      <h2>Errors</h2>
      <p>There were errors trying to parse these feeds:</p>
      <ul>
      ${forEach(errors, error => `
        <li>${error}</li>
      `)}
      </ul>
    ` : ''}

    <p>
      Powered by <a href="https://github.com/kevinfiol/rss-reader">Bubo Reader</a>, a project by <a href="https://george.mand.is">George Mandis</a> and <a href="https://kevinfiol.com">Kevin Fiol</a>.
    </p>
  </footer>
</body>
</html>
`);
}


/* Build */
function byDateSort(itemA, itemB) {
  if (itemA.isoDate == itemB.isoDate) return 0;
  if (itemA.isoDate > itemB.isoDate) return -1;
  return 1;
}

function escapeHtml(html) {
  if (!html) return html;
  return html.replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('\'', '&apos;')
    .replaceAll('"', '&quot;');
}

const parser = new Parser();
const errors = [];
const groupFeeds = {};

for (const groupName in FEED_URL_GROUPS) {
  groupFeeds[groupName] = [];

  await Promise.allSettled(
    Object.values(FEED_URL_GROUPS[groupName]).map(async url => {
      const start = Date.now()
      try {
        const response = await fetch(url, { method: 'GET' });
        console.info(`Fetched ${url} in ${(Date.now() - start) / 1000}s`);

        const body = await response.text();
        const feed = await parser.parseString(body);
        feed.feedUrl = url;
        feed.items = feed.items.slice(0, MAX_ITEMS_PER_FEED);
        feed.items.forEach((item) => {
          item.title = escapeHtml(item.title);
        });

        groupFeeds[groupName].push(feed);
      } catch (e) {
        console.error(e);
        errors.push(url);
      }
    })
  );
}

const groups = Object.entries(groupFeeds);
groups.forEach(([_groupName, feeds]) => {
  // for each group, sort the feeds by first item date
  feeds.sort((a, b) => byDateSort(a.items[0], b.items[0]));
});

const now = new Date();
const html = template({ groups, now, errors });

writeFileSync(OUTFILE_PATH, html, { encoding: 'utf8' });
console.log(`Reader built successfully at: ${OUTFILE_PATH}`);
