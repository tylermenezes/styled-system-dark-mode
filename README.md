# Styled-System Dark Mode

Many React apps implement dark mode by using `window` in Javascript. That causes a problem if you're using server-side
rendering and rehydration, because users will initially get the server-rendered page, which has no idea which mode
they prefer.

This project allows styled-system based apps to seamlessly render the correct color scheme, regardless of whether
server-side rendering was used. It works by replacing your colors with CSS variables. The dark and light versions of
these variables are injected into the page at render-time (using media queries to select the correct value).

## Installation

```bash
yarn install styled-system-dark-mode
```

or

```bash
npm i --save styled-system-dark-mode
```

## Usage

Call the default export, providing an object with two keys, dark and light. For example, I could pass the following:

```es6
{
  light: {
    text: colors.black,
    bg: colors.white,
    grad: {
      skeleton: `linear-gradient(270deg, ${colors.gray[300]} 0, ${colors.gray[100]} 50%, ${colors.gray[300]} 100%)`,
    },
  },
  dark: {
    text: colors.whiteAlpha[900],
    bg: colors.gray[900],
    grad: {
      skeleton: `linear-gradient(270deg, ${colors.gray[800]} 0, ${colors.gray[700]} 50%, ${colors.gray[800]} 100%)`,
    },
  },
}
```

Both objects **must** contain the same keys. You can't, for example, set all your defaults in your normal theme, and
then "overwrite" them for dark mode. You need to pass in a complete list of your CSS properties (which must be strings).

The call will return an object of:

- `vars`: The new variables to merge into your object. (In the example above, this would contain `text`, `bg`, and
  `grad: { skeleton }`.)
- `DarkModeProvider`: Container to wrap around your ThemeProvider, which will cause the SSR to emit the correct CSS.
- `css`: CSS string containing the variables. (You only need this if you need to pass styles to an `iframe`.)
- `resolve`: A function which resolves one of your "values" (a CSS variable reference) to its real value. Doesn't work
  properly server-side, so you should avoid this if possible.

You can call `mergeThemes(old, new)` to do a deep-merge of the two theme objects. This allows you to set different
options deep within your theme, for example you may want to set a different value for `font.weight` for dark and light
modes, but not affect other `font` properties.

(This is totally optional, and just provided for convenience.)

## Gotchas

- The object you pass into the default export can only contain strings, numbers, and other objects. You can't, for
  example, have a function as one of the values. Remember this will be rendered to CSS.
- Any object trying to resolve a variable using `styled-system` (or whatever else) will no longer get back an actual
  color, but a string like `var(--color-red)`.  You can call `resolve` to get the actual value, but if called during
  a server-side render, it will not be able to detect the user's color-scheme, and instead return the light mode value.
- No escaping is provided for the generated CSS which is injected into the browser. This could be used for HTML
  injection if passed untrusted input. (This is not an intended use-case, but if you have a use-case which requires it,
  you are welcome to send a PR.)

## Example

```jsx
import React from 'react';
import makeDarkMode, { mergeThemes } from 'styled-system-dark-mode';
import { ThemeProvider } from 'styled-components';
import myTheme from './theme';

export default ({ children }) => {
  const { colors, DarkModeProvider } = makeDarkMode(myTheme.colors.modes);

  return (
    <DarkModeProvider>
      <ThemeProvider theme={{ ...myTheme, colors: mergeThemes(myTheme.colors, colors) }}>
        {children}
      </ThemeProvider>
    </DarkModeProvider>
  );
};
```
