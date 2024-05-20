const markdownIt = require("markdown-it");
const { DateTime } = require("luxon");

const md = markdownIt({ html: true });

module.exports = function (eleventyConfig) {
  eleventyConfig.addPassthroughCopy("src/css/");
  eleventyConfig.addPassthroughCopy("src/img/");
  eleventyConfig.addPassthroughCopy("src/font/");
  eleventyConfig.addPassthroughCopy("src/favicon.ico");
  eleventyConfig.addWatchTarget("src/css/");
  eleventyConfig.addWatchTarget("src/img/");
  eleventyConfig.setFrontMatterParsingOptions({ excerpt: true });

  /*** FILTERS ***/
  eleventyConfig.addFilter("absoluteUrl", (url, base) => {
    return new URL(url, base).toString();
  });
  eleventyConfig.addFilter("renderFullDate", (dateObj) => {
    return DateTime.fromJSDate(dateObj)
      .setLocale("en-US")
      .toLocaleString(DateTime.DATE_FULL);
  });
  eleventyConfig.addFilter("renderBlogPostSummary", (post) => {
    return md.render(post.data.summary ?? post.page.excerpt ?? "");
  });

  /*** RETURN ***/
  return {
    dir: {
      input: "src",
      output: "public",
    },
  };
};
