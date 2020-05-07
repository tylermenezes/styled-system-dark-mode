import React from 'react';
import {
  makeObjectVariables,
  varColorMap,
  keyVarMap,
  treeWalk,
  objectToCss,
} from './utils';

/**
 * Builds a React component which sets CSS for client- and server-side rendering.
 *
 * @param {string} css CSS to set.
 * @returns {React.Component} A component which can wrap the website.
 */
const darkModeProviderFactory = (css) => ({ children }) => (
  // eslint-disable-next-line react/no-danger
  <><style dangerouslySetInnerHTML={{ __html: css }} />{children}</>
);

/**
 * Builds a function which can resolve CSS variables set by this library into real CSS variables.
 *
 * @param {object} defaultVars K-V object of CSS variables to defaults, in case this is called server-side.
 * @returns {Function} Function which can resolve values from this library to actual values.
 */
const resolveFactory = (defaultVars) => (value) => {
  if (value.substring(0, 5) !== 'var(--') return value;
  const lookupVal = value.substring(4, value.length - 1);

  if (typeof window === 'undefined') return defaultVars[lookupVal];

  // eslint-disable-next-line no-undef
  return window.getComputedStyle(window.document.documentElement)
    .getPropertyValue(lookupVal);
};

/**
 * Takes an object containing dark and light mode theme values, and returns new values for browser-enabled dark mode
 * detection without a flash of light mode.
 *
 * @param {object} params The parameters.
 * @param {object} params.dark Dark-mode options.
 * @param {object} params.light Light-mode options.
 * @returns {object} vars, css, resolve, and DarkModeProvider. See the documentation for more info.
 */
export default ({ dark, light }) => {
  const darkModeVars = makeObjectVariables(dark || {});
  const lightModeVars = makeObjectVariables(light || {});

  const vars = { ...keyVarMap(darkModeVars), ...keyVarMap(lightModeVars) };

  const darkModeCss = objectToCss(treeWalk(varColorMap(darkModeVars)));
  const lightModeCss = objectToCss(treeWalk(varColorMap(lightModeVars)));

  const css = `:root { ${lightModeCss} }`
    + `@media (prefers-color-scheme: dark){ :root { ${darkModeCss} } }`;
  const DarkModeProvider = darkModeProviderFactory(css);
  const resolve = resolveFactory(treeWalk(varColorMap(lightModeVars)));

  return {
    vars, css, resolve, DarkModeProvider,
  };
};

/**
 * Performs a deep merge of an old theme object, with the variables set by the styled-system-dark-mode library. This
 * allows for setting properties inside an object of an existing theme.
 *
 * @param {object} oldThemeObject The original theme. Any properties which conflict with the new theme will be ignored.
 * @param {object} newThemeObject The result from the default export of styled-system-dark-mode.
 * @returns {object} Merged objects.
 */
export const mergeThemes = (oldThemeObject, newThemeObject) => Object.keys({ ...oldThemeObject, ...newThemeObject })
  .reduce((accum, key) => ({
    ...accum,
    [key]: newThemeObject[key] instanceof Object
      ? mergeThemes(oldThemeObject[key], newThemeObject[key] || {})
      : newThemeObject[key] || oldThemeObject[key],
  }), {});
