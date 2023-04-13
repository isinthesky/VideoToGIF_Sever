module.exports = {
  env: {
    browser: true,
    commonjs: true,
    es2021: true,
  },
  extends: ["eslint:recommended", "plugin:react/recommended", "plugin:prettier/recommended"],
  plugins: ["prettier"],
  parserOptions: {
    ecmaVersion: "latest",
    createDefaultProgram: true,
  },
  rules: {
    "new-cap": "off",
    "require-jsdoc": "off",
    "no-var": "error",
    "no-multiple-empty-lines": "error",
    "no-console": ["warn", { allow: ["warn", "error", "info"] }],
    eqeqeq: "error",
    "no-unused-vars": "warn",
  },
  ignorePatterns: ["!.eslintrc.js", "!.prettierrc.json"],
};
