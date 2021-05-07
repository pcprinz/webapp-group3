/**
 * @author Christian Prinz
 */
import { fillSelectWithOptions } from "../../lib/util.js";
import { MovieStorage } from "../m/MovieStorage.js";
import { PersonStorage } from "../m/PersonStorage.js";

const form = document.forms["Movie"];
const deleteButton = form.deleteButton;
const selection = form.movieSelection;

// load all movies
PersonStorage.retrieveAll();
MovieStorage.retrieveAll();

// set up the movie selection list
fillSelectWithOptions(selection, MovieStorage.instances, {
  keyProp: "movieId",
  displayProp: "title",
});

// set an event handler for the delete button
deleteButton.addEventListener("click", () => {
  const movieId = selection.value;
  if (movieId) {
    MovieStorage.destroy(movieId);

    // remove deleted movie from selection
    selection.remove(selection.selectedIndex);
  }
});

// set a handler for the event when the browser / tab is closed
window.addEventListener("beforeunload", () => MovieStorage.persist());
