module.exports = {
  root: true,
  env: {
    es6: true,
    node: true,
  },
  extends: [
    "eslint:recommended",
  ],
  parser: "@typescript-eslint/parser",
  parserOptions: {
    sourceType: "module",
  },
  ignorePatterns: [
    "/lib/**/*", // Ignore built files.
    "/generated/**/*", // Ignore generated files.
    "**/*.js", // Ignore all JS files including this one
  ],
  plugins: [
    "@typescript-eslint",
    "import",
  ],
  rules: {
    // Disable all rules for now
  },
};
