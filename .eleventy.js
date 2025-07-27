export default function (eleventyConfig) {
  eleventyConfig.addPassthroughCopy("src/img/");
  eleventyConfig.addPassthroughCopy("src/font/");
  eleventyConfig.addPassthroughCopy("src/css/")
  eleventyConfig.addWatchTarget("src/img/");

  /*** FILTERS ***/
  eleventyConfig.addFilter("absoluteUrl", (url, base) => {
    return new URL(url, base).toString();
  });

  /*** RETURN ***/
  return {
    dir: {
      input: "src",
      output: "public",
    },
  };
};
