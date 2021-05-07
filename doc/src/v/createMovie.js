/**
 * @author Christian Prinz
 */
import { createChoiceWidget, fillSelectWithOptions } from "../../lib/util.js";
import { Movie, GenreEL, MovieRatingEL } from "../m/Movie.js";
import { MovieStorage } from "../m/MovieStorage.js";
import { PersonStorage } from "../m/PersonStorage.js";

const form = document.forms["Movie"];

// load all persons + movies
PersonStorage.retrieveAll();
MovieStorage.retrieveAll();

/*****************************************************************************
 * ### MOVIE_ID
 * - get the next id initially
 * @type {HTMLOutputElement}
 */
const movieIdInput = form["movieId"];
movieIdInput.addEventListener("input", () =>
  movieIdInput.setCustomValidity(Movie.checkMovieId(movieIdInput.value).message)
);
movieIdInput.value = MovieStorage.nextId().toString();

/*****************************************************************************
 * ### TITLE
 * - responsive validation
 * @type {HTMLInputElement}
 */
const titleSelection = form["title"];
titleSelection.addEventListener("input", () =>
  titleSelection.setCustomValidity(
    Movie.checkTitle(titleSelection.value).message
  )
);

/*****************************************************************************
 * ### RATING
 * - set up radio button group + mandatory check
 * @type {HTMLFieldSetElement}
 */
const ratingField = form.querySelector("fieldset[data-bind='rating']");
createChoiceWidget(
  ratingField,
  "rating",
  [],
  "radio",
  MovieRatingEL.labels,
  true
);
ratingField.addEventListener("click", () =>
  form.rating[0].setCustomValidity(
    !ratingField.getAttribute("data-value") ? "A rating must be selected!" : ""
  )
);

/*****************************************************************************
 * ### GENRES
 * - set up selection list
 * @type {HTMLSelectElement}
 */
const genresSelection = form["genres"];
fillSelectWithOptions(genresSelection, GenreEL.labels);

/*****************************************************************************
 * ### RELEASE_DATE
 * - responsive validation
 * @type {HTMLInputElement}
 */
const releaseDateSelection = form["releaseDate"];
releaseDateSelection.addEventListener("input", () =>
  releaseDateSelection.setCustomValidity(
    Movie.checkReleaseDate(releaseDateSelection.value).message
  )
);

/*****************************************************************************
 * ### SAVE_BUTTON
 * - set an event handler for the save button
 * - neutralize form on submit
 * @type {HTMLButtonElement}
 */
const saveButton = form["addButton"];
saveButton.addEventListener("click", () => {
  const slots = {
    movieId: movieIdInput.value,
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
  movieIdInput.setCustomValidity(Movie.checkMovieId(slots.movieId).message);
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

  // save the input data only if all of the form fields are valid
  // @ts-ignore
  form.checkValidity() && MovieStorage.add(slots);
});

// neutralize the submit event
form.addEventListener("submit", (e) => {
  e.preventDefault();
  form.reset();
  movieIdInput.value = MovieStorage.nextId().toString();
});

// Set a handler for the event when the browser window/tab is closed
window.addEventListener("beforeunload", () => MovieStorage.persist());
