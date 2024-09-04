const forEach = (arr, fn) => {
  let str = '';
  arr.forEach(i => str += fn(i) || '');
  return str;
};

export const template = ({ groups, errors, now }) => (`
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Cecilie's Feed Reader</title>
  <style>
    summary { cursor: pointer; }
    summary:hover { opacity: .75; }
    .feed-url { color: #aaa; }
  </style>
</head>
<body>
  <h1>Cecilie's Feed Reader</h1>
  <p>
    Last updated ${now.toLocaleString('en-US', { year: 'numeric', month: 'long', day: 'numeric'})}.
  </p>

  <main>
    ${forEach(groups, ([groupName, feeds]) => `
      <h2>${groupName}</h2>

      ${forEach(feeds, feed => `
        <details>
          <summary>
            ${feed.title}
            <span class="feed-url">(${feed.feed})</span>
          </summary>
          <ul>
            ${forEach(feed.items, item => `
              <li>${item.timestamp}: <a href="${item.link}">${item.title}</a></li>
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
    ` : ''
    }

    <p>
      Powered by <a href="https://github.com/kevinfiol/rss-reader">Bubo Reader</a>, a project by <a href="https://george.mand.is">George Mandis</a> and <a href="https://kevinfiol.com">Kevin Fiol</a>.
    </p>
  </footer>
</body>
</html>
`);