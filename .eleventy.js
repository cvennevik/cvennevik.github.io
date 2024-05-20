import markdownIt from "markdown-it";

export default function (eleventyConfig) {
  eleventyConfig.addPassthroughCopy("src/img/");
  eleventyConfig.addPassthroughCopy("src/font/");
  eleventyConfig.addWatchTarget("src/img/");
  eleventyConfig.setFrontMatterParsingOptions({ excerpt: true });

  /*** FILTERS ***/
  eleventyConfig.addFilter("absoluteUrl", (url, base) => {
    return new URL(url, base).toString();
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
