/**
 * @fileOverview a simple testing lib that contributes test functions, holds
 * errors in a list and returns them if needed
 * @author Christian Prinz
 */

/**
 * @type {string[]}
 */
var errors = [];

/**
 * stores the given error message, if the condition is `false`. errors can be retrieved with `resolveTest()`
 * @param {boolean} condition to be fulfilled
 * @param {string} message if the condition is not fulfilled
 */
export function test(condition, message) {
  !condition && errors.push(message);
}

/**
 * returns true if no error occurred. Otherwise it returns the existing error
 * messages as a `string[]` and clears the error list
 * @returns {string[] | boolean} `true` if no errors OTHERWISE a `string[]` of all error messages
 */
export function resolveTest() {
  if (errors.length > 0) {
    const result = [...errors];
    errors = [];
    return result;
  } else {
    return true;
  }
}
