const markdownIt = require("markdown-it");
const { DateTime } = require("luxon");

module.exports = function (eleventyConfig) {
  eleventyConfig.addPassthroughCopy("src/img/");
  eleventyConfig.addPassthroughCopy("src/font/");
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
    return markdownIt({ html: true }).render(post.data.summary ?? post.page.excerpt ?? "");
  });

  /*** RETURN ***/
  return {
    dir: {
      input: "src",
      output: "public",
    },
  };
};
