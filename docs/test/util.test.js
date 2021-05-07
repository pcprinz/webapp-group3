/**
 * @author Christian Prinz
 */
import { compareDates, isDateOrDateString } from "../lib/util.js";
import { resolveTest, test } from "./Tester.js";

function test_isDateOrDateString() {
  const date1 = new Date("2012-12-12");
  const undef1 = undefined;
  const str1 = "2012-01-05";
  const wrong1 = "wrong";

  test(isDateOrDateString(date1), "date1 is no Date");
  test(!isDateOrDateString(undef1), "undef1 is Date");
  test(isDateOrDateString(str1), "str1 is no Date (string)");
  test(!isDateOrDateString(wrong1), "wrong1 is Date");

  return resolveTest();
}

function test_compareDates() {
  const date1 = new Date("2012-12-12"),
    date2 = new Date("2012-12-10");
  const undef1 = undefined,
    undef2 = undefined;
  const str1 = "2012-01-05",
    str2 = "2012-12-12";
  const wrong1 = "wrong",
    wrong2 = "very wrong";

  // -2
  test(compareDates(undef1, date2) === -2, "undef1 ~ date2 !== -2");
  test(compareDates(wrong1, date2) === -2, "wrong1 ~ date2 !== -2");

  // -1
  test(compareDates(date2, date1) === -1, "date2 ~ date1 !== -1");
  test(compareDates(str1, date1) === -1, "str1 ~ date1 !== -1");
  test(compareDates(str1, str2) === -1, "str1 ~ str2 !== -1");

  // 0
  test(compareDates(date1, date1) === 0, "date1 ~ date1 !== 0");
  test(compareDates(str1, str1) === 0, "str1 ~ str1 !== 0");
  test(compareDates(date1, str2) === 0, "date1 ~ str2 !== 0");
  test(compareDates(undef1, undef2) === 0, "undef1 ~ undef2 !== 0");
  test(compareDates(undef1, wrong2) === 0, "undef1 ~ wrong2 !== 0");
  test(compareDates(wrong1, undef2) === 0, "wrong1 ~ undef2 !== 0");
  test(compareDates(wrong1, wrong2) === 0, "wrong1 ~ wrong2 !== 0");

  // 1
  test(compareDates(date1, date2) === 1, "date1 ~ date2 !== 1");
  test(compareDates(date1, str1) === 1, "date1 ~ str1 !== 1");
  test(compareDates(str2, str1) === 1, "str2 ~ str1 !== 1");

  // 2
  test(compareDates(date1, undef1) === 2, "date1 ~ undef1 !== 2");
  test(compareDates(date1, wrong2) === 2, "date1 ~ wrong2 !== 2");

  return resolveTest();
}

export const tests = [
  { name: "util/isDateOrDateString", result: test_isDateOrDateString() },
  { name: "util/compareDates", result: test_compareDates() },
];
