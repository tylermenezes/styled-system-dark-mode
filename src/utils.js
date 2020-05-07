/**
 * Converts a JS name (in either camel or snake case) into an equally readable CSS variable name.
 *
 * @param {string} name Original variable name.
 * @returns {string} Lowercased name with word separators replaced with -.
 */
const jsNameToCssName = (name) => name.split(/(?=[A-Z_ ])/g).join('-').toLowerCase();

/**
 * Takes an k-v object, and converts it into an object with the same keys, but where the values are now an object
 * of: value (the original value), var (the variable name), and refVar(the variable reference). Operates recursively,
 * so values may be k-v objects themselves.
 *
 * @param {object} obj The k-v object to convert.
 * @param {string=} prefix Optional prefix for the variable.
 * @param {string=} suffix Optional suffix for the variable.
 * @returns {object} Object containing CSS variable info for each val.
 */
export const makeObjectVariables = (obj, prefix, suffix) => Object.keys(obj)
  .reduce((accum, key) => {
    const prefixStr = prefix ? `${prefix}-` : '';
    const suffixStr = suffix ? `-${suffix}` : '';
    const name = `${prefixStr}${jsNameToCssName(key)}${suffixStr}`;

    return {
      ...accum,
      [key]: {
        value: typeof obj[key] === 'string' ? obj[key] : makeObjectVariables(obj[key], `${prefixStr}${key}`, suffix),
        var: `--${name}`,
        refVar: `var(--${name})`,
      },
    };
  }, {});

/**
 * Turns an object from makeObjectVariables into a k-v pair, where k is the CSS variable name, and v is the color.
 *
 * @param {object} obj The object to convert.
 * @returns {object} k-v object.
 */
export const varColorMap = (obj) => Object.keys(obj)
  .reduce((accum, key) => {
    const val = obj[key].value;
    return {
      ...accum,
      [obj[key].var]: typeof val === 'string' ? val : varColorMap(val),
    };
  }, {});

/**
 * Turns an object from makeObjectVariables into a k-v pair, where k is the original key, and v is the CSS variable ref.
 *
 * @param {object} obj The object to convert.
 * @returns {object} k-v object.
 */
export const keyVarMap = (obj) => Object.keys(obj)
  .reduce((accum, key) => ({
    ...accum,
    [key]: typeof obj[key].value === 'string' ? obj[key].refVar : keyVarMap(obj[key].value),
  }), {});

/**
 * Flattens a nested k-v, returning each key and value from all leaf nodes into the root node.
 *
 * @param {object} obj Nested k-v object.
 * @returns {object} Object with all elements at root node.
 */
export const treeWalk = (obj) => Object.keys(obj)
  .reduce((accum, key) => ({
    ...accum,
    ...(typeof obj[key] === 'string' ? { [key]: obj[key] } : treeWalk(obj[key])),
  }), {});

/**
 * Renders a k-v to CSS properties, where k is the name, and v is the value.
 *
 * @param {object} obj Flattened k-v pairs.
 * @returns {string} CSS string.
 */
export const objectToCss = (obj) => Object.keys(obj)
  .map((key) => ({ property: key, value: obj[key] }))
  .map((kv) => `${kv.property}: ${kv.value};`)
  .join(`\n`);
