module.exports = {
  "{apps,libs,tools}/**/*.{js,ts,jsx,tsx,json}": [
    (files) => `yarn lint --files=${files.join(",")}`,
    (files) => `yarn format --files=${files.join(",")}`
  ]
};
