/**
 * @fileOverview  Defines utility procedures/functions
 * @author Gerd Wagner
 * @author Christian Prinz
 */

/**
 * Creates a typed "data clone" of an object
 * @param {object} obj to get a clone of
 * @returns {object} - the cloned object
 */
export function cloneObject(obj) {
  var p = "";
  var val;
  var clone = Object.create(Object.getPrototypeOf(obj));
  for (p in obj) {
    if (obj.hasOwnProperty(p)) {
      val = obj[p];
      if (
        typeof val === "number" ||
        typeof val === "string" ||
        typeof val === "boolean" ||
        val instanceof Date ||
        /* typed object reference */
        (typeof val === "object" && !!val.constructor) ||
        /* list of data values */
        (Array.isArray(val) && !val.some((el) => typeof el === "object")) ||
        /* list of typed object references */
        (Array.isArray(val) &&
          val.every((el) => typeof el === "object" && !!el.constructor))
      ) {
        if (Array.isArray(val)) clone[p] = val.slice(0);
        else clone[p] = val;
      }
      // else clone[p] = cloneObject(val);
    }
  }
  return clone;
}

/**
 * Verifies if the given value is ether of type `Date` or a valid date string.
 * @param {Date | string} date to validate
 * @returns {boolean} `true` if the date is a `Date` or a string that can be parsed to a date
 */
export function isDateOrDateString(date) {
  return date instanceof Date || !isNaN(Date.parse(date));
}

/**
 * receives a date and immediately returns it, if it is `instanceof Date`,
 * or creates a new Date otherwise. Then it has to be validated as a date string
 * @param {Date | string} date to possibly parse
 * @returns {Date}
 */
export function parseDate(date) {
  return date instanceof Date ? date : new Date(date);
}

/**
 * @param {Date} date
 * @returns the date as a string in form of `"YYYY-MM-DD"`
 */
export function getRawDate(date) {
  return date.toISOString().slice(0, 10);
}

/**
 * compares two possible dates on equality. This function also considers string
 * formatted and undefined dates.
 * @param {Date | string | undefined} a
 * @param {Date | string | undefined} b
 * @returns {-2 | -1 | 0 | 1 | 2} a `number` that indicates the result:
 * - `-2 = !a & b` (`a` is undefined or no Date, but `b`)
 * - `-1 = a < b`
 * - `0 = equal` (both equal || undefined || no Date)
 * - `1 = a > b`
 * - `2 = a & !b` (`b` is undefined or no Date, but `a`)
 */
export function compareDates(a, b) {
  // both undefined OR no dates => TRUE
  if ((!a || !isDateOrDateString(a)) && (!b || !isDateOrDateString(b)))
    return 0;
  // ==> AT LEAST ONE OF THEM IS A DATE
  // a is undefined OR no Date but b is both
  else if ((!a && b) || (!isDateOrDateString(a) && isDateOrDateString(b)))
    return -2;
  // b is undefined OR no Date but a is both
  else if ((a && !b) || (isDateOrDateString(a) && !isDateOrDateString(b)))
    return 2;
  // => BOTH ARE DEFINED AND DATES
  else {
    if (parseDate(a).getTime() === parseDate(b).getTime()) return 0;
    else return parseDate(a).getTime() > parseDate(b).getTime() ? 1 : -1;
  }
}

/**
 * Verifies if a value represents an integer or integer string
 * @param {string | number} x to verify
 * @return {boolean}
 */
export function isIntegerOrIntegerString(x) {
  return (
    (typeof x === "number" && Number.isInteger(x)) ||
    (typeof x === "string" && x.search(/^-?[0-9]+$/) === 0)
  );
}

/**
 * receives a number and immediately returns it, if it is `typeof "number"`,
 * or parses it with `Number(...)` otherwise.
 * @param {number | string} s the string OR number to parse
 * @returns {number} the parsed number
 */
export function parseStringInteger(s) {
  return typeof s === "number" ? s : Number(s);
}

/**
 * Create a DOM option element
 *
 * @param {string} val the option.value
 * @param {string | undefined} txt [optional] the option.txt - will be replaced with `val` if undefined
 * @param {string | undefined} classValues [optional] the option.className
 *
 * @return {object} an `"option"` document element
 */
function createOption(val, txt, classValues) {
  var el = document.createElement("option");
  el.value = val;
  el.text = txt || val;
  if (classValues) el.className = classValues;
  return el;
}

/**
 * Fill a select element with option elements created from a
 * map of objects
 *
 * @param {object} selectEl  A select(ion list) element
 * @param {object|array} selectionRange  A map of objects or an array list
 * @param {object} optPar [optional]  An optional parameter record including
 *     optPar.displayProp and optPar.selection
 */
export function fillSelectWithOptions(selectEl, selectionRange, optPar) {
  // create option elements from object property values
  const options = Array.isArray(selectionRange)
    ? selectionRange
    : Object.keys(selectionRange);

  // delete old contents
  selectEl.innerHTML = "";

  // create "no selection yet" entry
  if (!selectEl.multiple) {
    selectEl.add(createOption("", " --- ", undefined));
  }
  for (const i of options.keys()) {
    let optionEl = null;
    if (Array.isArray(selectionRange)) {
      optionEl = createOption((i + 1).toString(), options[i], undefined);
      if (
        selectEl.multiple &&
        optPar &&
        optPar.selection &&
        optPar.selection.includes(i + 1)
      ) {
        // flag the option element with this value as selected
        optionEl.selected = true;
      }
    } else {
      const key = options[i];
      const obj = selectionRange[key];
      if (optPar && optPar.displayProp) {
        optionEl = createOption(key, obj[optPar.displayProp], undefined);
      } else {
        optionEl = createOption(key, undefined, undefined);
      }

      // if invoked with a selection argument, flag the selected options
      if (
        selectEl.multiple &&
        optPar &&
        optPar.selection &&
        optPar.selection[key]
      ) {
        // flag the option element with this value as selected
        optionEl.selected = true;
      }
    }
    selectEl.add(optionEl);
  }
}

/**
 * Create a choice control (radio button or checkbox) element
 *
 * @param {"radio" | "checkbox"} t  The type of choice control ("radio" or "checkbox")
 * @param {string} n  The name of the choice control input element
 * @param {string} v  The value of the choice control input element
 * @param {string} lbl  The label text of the choice control
 * @return {HTMLLabelElement}
 */
function createLabeledChoiceControl(t, n, v, lbl) {
  var ccEl = document.createElement("input");
  var lblEl = document.createElement("label");
  ccEl.type = t;
  ccEl.name = n;
  ccEl.value = v;
  lblEl.appendChild(ccEl);
  lblEl.appendChild(document.createTextNode(lbl));
  return lblEl;
}

/**
 * Create a choice widget in a given fieldset element.
 * A choice element is either an HTML radio button or an HTML checkbox.
 * @param {HTMLFieldSetElement} containerEl the element (widget) containing the choices
 * @param {string} fld the identifier of the widget
 * @param {number[]} values the initial values that are set
 * @param {"radio" | "checkbox"} choiceWidgetType the type of the widget (`"radio" | "checkbox"`)
 * @param {string[]} choiceItems the labels of the choices
 * @param {boolean} isMandatory if true -> presets the first option
 * @returns {HTMLFieldSetElement} the modified `containerEl`, but also works without using the returned element though it is modified anyways.
 */
export function createChoiceWidget(
  containerEl,
  fld,
  values,
  choiceWidgetType,
  choiceItems,
  isMandatory
) {
  const choiceControls = containerEl.querySelectorAll("label");
  // remove old content
  for (const j of choiceControls.keys()) {
    containerEl.removeChild(choiceControls[j]);
  }
  if (!containerEl.hasAttribute("data-bind")) {
    containerEl.setAttribute("data-bind", fld);
  }
  // for a mandatory radio button group initialize to first value
  if (choiceWidgetType === "radio" && isMandatory && values.length === 0) {
    values[0] = 1;
  }
  if (values.length >= 1) {
    if (choiceWidgetType === "radio") {
      containerEl.setAttribute("data-value", values[0].toString());
    } else {
      // checkboxes
      containerEl.setAttribute("data-value", "[" + values.join() + "]");
    }
  }
  for (const j of choiceItems.keys()) {
    // button values = 1..n
    const el = createLabeledChoiceControl(
      choiceWidgetType,
      fld,
      (j + 1).toString(),
      choiceItems[j]
    );
    /** @ts-ignore @type {HTMLInputElement} */
    const firstChild = el.firstElementChild;
    // mark the radio button or checkbox as selected/checked
    if (values.includes(j + 1)) firstChild.checked = true;
    containerEl.appendChild(el);
    firstChild.addEventListener("click", (e) => {
      /** @ts-ignore @type {HTMLInputElement} */
      const btnEl = e.target;
      if (choiceWidgetType === "radio") {
        if (containerEl.getAttribute("data-value") !== btnEl.value) {
          containerEl.setAttribute("data-value", btnEl.value);
        } else if (!isMandatory) {
          // turn off radio button
          btnEl.checked = false;
          containerEl.setAttribute("data-value", "");
        }
      } else {
        // checkbox
        let cbValues = JSON.parse(containerEl.getAttribute("data-value")) || [];
        let i = cbValues.indexOf(parseInt(btnEl.value));
        if (i > -1) {
          cbValues.splice(i, 1); // delete from value list
        } else {
          // add to value list
          cbValues.push(btnEl.value);
        }
        containerEl.setAttribute("data-value", "[" + cbValues.join() + "]");
      }
    });
  }
  return containerEl;
}

/**
 * checks if a given string is of type `string` and of length `[min, max]`
 * - eg.: `isStringInRange(x,2,6)` returns `true` if `x.length >= 2 && x.length <=6`
 * - the `max` value is optional. If it is `undefined` then the upper bound will be 
 * `Number.MAX_VALUE` which is *Equal to approximately 1.79E+308*
 * @param {string} str to check
 * @param {number} min the inclusive minimum length the string must have
 * @param {number} max [optional] the inclusive maximum length the string must be lower than
 * @returns {boolean} `true` if the string is a string and inside the range
 */
export function isStringInRange(str, min, max = Number.MAX_VALUE) {
  return typeof str === "string" && str.length >= min && str.length < max;
}

// UNUSED SO FAR **************************************************************

/**
 * Verifies if the value is a string and has at least one Character (whitespace-trimmed).
 * @param {string} x
 * @return {boolean}
 */
export function isNonEmptyString(x) {
  return typeof x === "string" && x.trim() !== "";
}
