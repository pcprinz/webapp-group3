/**
 * @author Christian Prinz
 */
import { Movie, GenreEL, MovieRatingEL } from "../m/Movie.js";
import { MovieStorage } from "../m/MovieStorage.js";
import { PersonStorage } from "../m/PersonStorage.js";

// this makes my ESLint type this const correctly as "HTMLTableSectionElement"
const tableBody = document.querySelector("table").querySelector("tbody");

// load all movie objects
PersonStorage.retrieveAll();
MovieStorage.retrieveAll();

// for each movie, create a table row with a cell for each attribute
for (let key of Object.keys(MovieStorage.instances)) {
  const row = tableBody.insertRow();
  /** @type {Movie} */
  const movie = MovieStorage.instances[key];
  row.insertCell().textContent = movie.movieId.toString();
  row.insertCell().textContent = movie.title;
  row.insertCell().textContent = MovieRatingEL.labels[movie.rating];
  row.insertCell().textContent = GenreEL.stringify(movie.genres);
  row.insertCell().textContent = movie.releaseDate
    ? movie.releaseDate.toLocaleDateString()
    : "unknown";
}
