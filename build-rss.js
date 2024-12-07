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
const OUTFILE_PATH = './src/_data/feedsData.json';
const MAX_ITEMS_PER_FEED = 5;
const FEED_URL_GROUPS = {
  "Feeds": [
    "http://agileotter.blogspot.com/feeds/posts/default",
    "https://infrequently.org/feed/",
    "https://feedpress.me/baldurbjarnason",
    "https://danluu.com/atom.xml",
    "https://robinrendle.com/feed.xml",
    "https://charity.wtf/feed/",
    "https://lexi-lambda.github.io/feeds/all.atom.xml",
    "https://jvns.ca/atom.xml",
    "https://einarwh.wordpress.com/feed/",
    "https://www.hillelwayne.com/post/index.xml",
    "https://chelseatroy.com/feed/",
    "https://www.worthe-it.co.za/atom.xml",
    "https://apenwarr.ca/log/rss.php",
    "https://dbushell.com/rss.xml",
    "https://rosswintle.uk/feed/",
    "https://gomakethings.com/feed/index.xml",
    "https://blog.jim-nielsen.com/feed.xml",
    "https://kyleshevlin.com/rss.xml",
    "https://angryweasel.com/blog/feed/",
    "https://2ality.com/feeds/posts.atom",
    "https://buttondown.email/hillelwayne/rss",
    "https://adrianroselli.com/feed",
    "https://www.geepawhill.org/feed/",
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
    "https://www.simplermachines.com/rss/",
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
    "https://knowler.dev/feed.xml",
    "https://hazelweakly.me/atom.xml",
    "https://www.youtube.com/feeds/videos.xml?channel_id=UCaSCt8s_4nfkRglWCvNSDrg",
    "https://angryweasel.substack.com/feed",
    "https://jakelazaroff.com/rss.xml",
    "https://www.softwaremaxims.com/feed.xml",
    "https://dragan-stepanovic.github.io/feed.xml",
    "https://newsletter.goodtechthings.com/feed",
    "https://blog.ferrata.dev/rss/",
    "https://chocolatedrivendevelopment.com/feed.xml",
    "https://blog.codemanship.dev/rss.xml",
    "https://brainsik.net/index.xml",
    "https://www.lisihocke.com/feeds/posts/default",
    "https://read.ceilfors.com/feed",
    "https://thathtml.blog/feed.xml",
    "https://nonlinear.garden/rss.xml",
    "https://www.cvennevik.no/blog/rss.xml",
    "https://frills.dev/all.xml",
    "https://leanrada.com/rss.xml",
    "https://boehs.org/in/blog.xml",
    "https://uncenter.dev/feed.xml",
    "https://smallsheds.garden/blog/feed.atom",
    "https://dbushell.com/notes/rss.xml",
    "https://lalaland.mataroa.blog/rss/",
    "https://garoof.no/feed.xml",
    "https://flamedfury.com/feed.xml",
    "https://mikegrindle.com/feed.xml",
    "https://sarajoy.dev/rss.xml",
    "https://molily.de/feed.xml",
    "https://fynn.be/feed.xml",
    "https://dubroy.com/blog/rss.xml",
    "https://anniemueller.com/posts_feed",
    "https://ntietz.com/atom.xml"
  ]
};

/* Build */
const parser = new Parser();
const errors = [];
const groupFeeds = {};

for (const groupName in FEED_URL_GROUPS) {
  groupFeeds[groupName] = [];

  await Promise.allSettled(
    Object.values(FEED_URL_GROUPS[groupName]).map(async url => {
      try {
        const response = await fetch(url, { method: 'GET' });
        const body = await response.text();
        const feed = await parser.parseString(body);
        const items = feed.items
          .sort((a, b) => {
            if (a.isoDate == b.isoDate) return 0;
            if (a.isoDate < b.isoDate) return 1;
            return -1;
          })
          .slice(0, MAX_ITEMS_PER_FEED)
          .map(item => {
            // Only keep the fields we use, to save space
            return {
              title: item.title,
              date: item.isoDate ? item.isoDate.split('T')[0] : '0000-00-00',
              link: item.link
            }
        });

        groupFeeds[groupName].push({
          title: feed.title,
          feedUrl: url,
          items
        });
      } catch (e) {
        console.error(e);
        errors.push(url);
      }
    })
  );
}

const groups = [];
Object.entries(groupFeeds).forEach(([name, feeds]) => {
  // for each group, sort feeds by most recently updated
  feeds.sort((a, b) => {
    if (a.items[0].date == b.items[0].date) return 0;
    if (a.items[0].date < b.items[0].date) return 1;
    return -1;
  });

  groups.push({ name, feeds });
})

const fetchDate = new Date();
const outputJson = JSON.stringify({ groups, fetchDate, errors }, null, 2);
writeFileSync(OUTFILE_PATH, outputJson, { encoding: 'utf8' });
console.log(`Feed data fetched successfully at: ${OUTFILE_PATH}`);
