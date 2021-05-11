import { MovieStorage } from "../m/MovieStorage.js";
import { PersonStorage } from "../m/PersonStorage.js";

 /** key for the `localStorage[key]` for the `this.instances` */
const MOVIES_STORAGE_KEY = "movies";
/** key for the `localStorage[key]` for the `instances` */
const PERSON_STORAGE_KEY = "person";

/*******************************************
*** Auxiliary methods for testing **********
********************************************/
/**
*  Create and save test data
*/
function generateTestData() {
  try {
    PersonStorage.add({personId: 1, name: "Stephen Frears"});
    PersonStorage.add({personId: 2, name: "George Lucas"});
    PersonStorage.add({personId: 3, name: "Quentin Terrentino"});
    PersonStorage.add({personId: 4, name: "Uma Thurman"});
    PersonStorage.add({personId: 5, name: "John Travolta"});
    PersonStorage.add({personId: 6, name: "Ewan McGregor"});
    PersonStorage.add({personId: 7, name: "Natalie Portman"});
    PersonStorage.add({personId: 8, name: "Keanu Reeves"});
    PersonStorage.persist();

    MovieStorage.add({movieId: 1, title: "Pulp Fiction", releaseDate: "1994-05-12",
      director: 3, actors: [4, 5]});
    MovieStorage.add({movieId: 2, title: "Star Wars", releaseDate: "1977-05-25",
      director: 2, actors: [6, 7]});
    MovieStorage.add({movieId: 3, title: "Dangerous Liaisons", releaseDate: "1988-12-16",
      director: 1, actors: [4, 8]});
    MovieStorage.persist();
  } catch (e) {
    console.log( `${e.constructor.name}: ${e.message}`);
  }
};
/**
  * Clear data
  */
function clearData() {
  if (confirm( "Do you really want to delete the entire database?")) {
    try {
      MovieStorage.clear();
      localStorage[MOVIES_STORAGE_KEY] = "{}";
      PersonStorage.clear();
      localStorage[PERSON_STORAGE_KEY] = "{}";
      console.log("Database cleared.");
    } catch (e) {
      console.log( `${e.constructor.name}: ${e.message}`);
    }
  }
};

export { generateTestData, clearData };