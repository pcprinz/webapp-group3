/**
 * @author Christian Prinz
 */
import {
  createChoiceWidget,
  fillSelectWithOptions,
  getRawDate,
} from "../../lib/util.js";
import { Movie, GenreEL, MovieRatingEL } from "../m/Movie.js";
import { MovieStorage } from "../m/MovieStorage.js";
import { PersonStorage } from "../m/PersonStorage.js";

const form = document.forms["Movie"];

// load all movies
PersonStorage.retrieveAll();
MovieStorage.retrieveAll();

/*****************************************************************************
 * ### MOVIE_ID
 * @type {HTMLInputElement}
 * ! The movieId just has an Output on `update` because it is immutable.
 * Though there is no check needed
 */
const movieIdOutput = form["movieId"];

/*****************************************************************************
 * ### TITLE
 * - responsive validation
 * @type {HTMLInputElement}
 */
const titleSelection = form["title"];
titleSelection.addEventListener("input", () => {
  titleSelection.setCustomValidity(
    Movie.checkTitle(titleSelection.value).message
  );
});

/*****************************************************************************
 * ### RATING
 * - set up radio button group + mandatory check
 * @type {HTMLFieldSetElement}
 */
const ratingField = form.querySelector("fieldset[data-bind='rating']");
ratingField.addEventListener("click", () => {
  form.rating[0].setCustomValidity(
    !ratingField.getAttribute("data-value") ? "A rating must be selected!" : ""
  );
});

/*****************************************************************************
 * ### GENRES
 * - set up selection list
 * @type {HTMLSelectElement}
 */
const genresSelection = form["genres"];

/*****************************************************************************
 * ### RELEASE_DATE
 * - responsive validation
 * @type {HTMLInputElement}
 */
const releaseDateSelection = form["releaseDate"];
releaseDateSelection.addEventListener("input", () => {
  releaseDateSelection.setCustomValidity(
    Movie.checkReleaseDate(releaseDateSelection.value).message
  );
});

/*****************************************************************************
 * ### MOVIE_SELECTION
 * - fill with options
 * - change listener
 * @type {HTMLSelectElement}
 */
const selection = form["movieSelection"];
fillSelectWithOptions(selection, MovieStorage.instances, {
  keyProp: "movieId",
  displayProp: "title",
});

// when a movie is selected, populate the form with its data
selection.addEventListener("change", () => {
  const movieKey = selection.value;

  // fill the form with the movie's data
  if (movieKey) {
    const movie = MovieStorage.instances[movieKey];
    movieIdOutput.value = movieKey;
    titleSelection.value = movie.title;
    // set up the rating radio button group
    createChoiceWidget(
      ratingField,
      "rating",
      [movie.rating],
      "radio",
      MovieRatingEL.labels,
      true
    );
    // set up the genres forms selection list
    fillSelectWithOptions(genresSelection, GenreEL.labels, {
      selection: movie.genres,
    });
    genresSelection.setCustomValidity("");
    releaseDateSelection.value = movie.releaseDate
      ? getRawDate(movie.releaseDate)
      : "";
  } else {
    form.reset();
    genresSelection.innerHTML = "";
  }
});

/*****************************************************************************
 * ### SAVE_BUTTON
 * - set an event handler for the save button
 * - neutralize form on submit
 * @type {HTMLButtonElement}
 */
const saveButton = form["saveButton"];

// event handler for save button
saveButton.addEventListener("click", () => {
  const slots = {
    movieId: selection.value,
    title: titleSelection.value,
    rating: ratingField.getAttribute("data-value"),
    genres: [],
    releaseDate: undefined,
  };

  // construct the list of selected genres
  for (const o of genresSelection.selectedOptions) {
    slots.genres.push(parseInt(o.value));
  }

  // set error messages in case of constraint violations
  titleSelection.setCustomValidity(Movie.checkTitle(slots.title).message);
  form.rating[0].setCustomValidity(Movie.checkRating(slots.rating).message);
  genresSelection.setCustomValidity(Movie.checkGenres(slots.genres).message);
  if (releaseDateSelection.value) {
    slots.releaseDate = releaseDateSelection.value;
    releaseDateSelection.setCustomValidity(
      Movie.checkReleaseDate(slots.releaseDate).message
    );
  }

  // show possible errors
  form.reportValidity();

  // save the input date only if all of the form fields are valid
  if (form.checkValidity()) {
    // @ts-ignore
    MovieStorage.update(slots);

    // update the selection list option element
    selection.options[selection.selectedIndex].text = slots.title;
  }
});

// neutralize the submit event
form.addEventListener("submit", (e) => {
  e.preventDefault();
  form.reset();
});

// set an event handler for the event when the browser window / tab is closed
window.addEventListener("beforeunload", () => MovieStorage.persist());
