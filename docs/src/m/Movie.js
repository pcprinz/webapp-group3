/**
 * @author Christian Prinz
 */
import { Enumeration } from "../../lib/Enumeration.js";
import {
  IntervalConstraintViolation,
  MandatoryValueConstraintViolation,
  NoConstraintViolation,
  RangeConstraintViolation,
  UniquenessConstraintViolation,
} from "../../lib/errorTypes.js";
import {
  getRawDate,
  isDateOrDateString,
  isIntegerOrIntegerString,
  isStringInRange,
  parseDate,
  parseStringInteger,
} from "../../lib/util.js";
import { MovieStorage } from "./MovieStorage.js";
import { Person } from "./Person.js";
import { PersonStorage } from "./PersonStorage.js";

// *** ENUMERATIONS ***********************************************************

export const GenreEL = new Enumeration([
  "Action",
  "Adventure",
  "Animation",
  "Comedy",
  "Crime",
  "Documentary",
  "Drama",
  "Fantasy",
  "Family",
  "Film-Noir",
  "Horror",
  "Musical",
  "Romance",
  "Sci-Fi",
  "War",
]);
export const MovieRatingEL = new Enumeration({
  G: "General Audiences",
  PG: "Parental Guidance",
  PG13: "Not Under 13",
  R: "Restricted",
  NC17: "Not Under 17",
});

/**
 * The creation slots of the movie.
 * @typedef {object} MovieSlots
 * @prop {number} movieId
 * @prop {string} title
 * @prop {number | undefined} rating
 * @prop {number[]} genres
 * @prop {Date | string | undefined} releaseDate
 * @prop {Person | number} director
 * @prop {Person[] | number[] | {[key: number]: Person} | undefined} actors
 */

/**
 * The entity of a Movie
 */
export class Movie {
  /** the unique identifier of the movie
   * - unique required PositiveInteger {id}
   *
   * @private
   * @type {number}
   */
  _movieId;
  /** the official title of the movie
   * - required NonEmptyString(120)
   * @private
   * @type {string}
   */
  _title;
  /** the rating the movie is restricted to
   * - optional
   * @private
   * @type {number}
   */
  // _rating;
  /** the genres the movie is associated to
   * - required multiValue
   * @private
   * @type {number[]}
   */
  // _genres;
  /** the date the movie was released
   * - optional
   * - Date
   * - min: "1895-12-28"
   * @private
   * @type {Date}
   */
  _releaseDate;

  /** the director of the movie
   * - required Person
   * @private
   * @type {Person}
   */
  _director;

  /** the actors starring the movie
   * - optional multiValue
   * @private
   * @type {{[key: number]: Person}}
   */
  _actors;

  /**
   * CONSTRUCTOR
   * @param {MovieSlots} slots - Object creation slots
   */
  constructor({
    movieId,
    title,
    // rating,
    // genres,
    releaseDate,
    director,
    actors,
  }) {
    if (arguments.length > 0) {
      this.movieId = movieId;
      this.title = title;
      // this.genres = genres;
      // if (rating) {
      //   this.rating = rating;
      // }
      if (releaseDate) {
        // @ts-ignore
        this.releaseDate = releaseDate;
      }
      // @ts-ignore
      this.director = director;
      if (actors) {
        // @ts-ignore
        this.actors = actors;
      } else {
        this.actors = [];
      }
    }
  }

  // *** movieId **************************************************************

  /**
   * @returns {number} the unique identifier of the movie
   */
  get movieId() {
    return this._movieId;
  }

  /**
   * sets a new movieId
   * - @private this is just used internally though the id is frozen
   * @param {number} movieId
   */
   set movieId(movieId) {
    const validationResult = Movie.checkMovieId(movieId);
    if (validationResult instanceof NoConstraintViolation) {
      this._movieId = parseStringInteger(movieId);
    } else {
      throw validationResult;
    }
  }

  /**
   * checks if the given movieId is present, >0 and unique
   * @param {number | string} movieId
   * @returns a ConstraintViolation
   */
  static checkMovieId(movieId) {
    if (!movieId && movieId !== 0) {
      return new MandatoryValueConstraintViolation(
        "The movie's movieId is required!"
      );
    } else if (!isIntegerOrIntegerString(movieId)) {
      return new RangeConstraintViolation(
        `The movie's movieId  must be an Integer, but is (${movieId}: ${typeof Movie})!`
      );
    } else if (parseStringInteger(movieId) < 0) {
      return new IntervalConstraintViolation(
        `The movie's movieId must be larger than 0, but is ${movieId}!`
      );
    } else if (MovieStorage.contains(movieId)) {
      return new UniquenessConstraintViolation(
        `The movie's movieId (${movieId}) is already taken by another movie!`
      );
    } else {
      return new NoConstraintViolation();
    }
  }

  

  // *** title ****************************************************************

  /** @returns {string} the official title of the movie */
  get title() {
    return this._title;
  }

  /** @param {string} title - the new title to set */
  set title(title) {
    const validationResult = Movie.checkTitle(title);
    if (validationResult instanceof NoConstraintViolation) {
      this._title = title.trim();
    } else {
      throw validationResult;
    }
  }

  /**
   * checks if the given title is present and between [1,120] letters
   * @param {string} title
   * @returns a ConstraintViolation
   * @public
   */
  static checkTitle(title) {
    if (!title) {
      return new MandatoryValueConstraintViolation(
        "The movie's title is required!"
      );
    } else if (typeof title !== "string") {
      return new RangeConstraintViolation(
        `The movie's title (${title}) must be of type "string", but is ${typeof title}!`
      );
    } else if (!isStringInRange(title.trim(), 1, 120)) {
      return new IntervalConstraintViolation(
        `The movie's title must have a length between 1 and 120 letters, but is ${title.length}!`
      );
    } else {
      return new NoConstraintViolation();
    }
  }

  // *** releaseDate **********************************************************

  /** @ts-ignore @returns {Date} the date the movie was released */
  get releaseDate() {
    return this._releaseDate;
  }

  /** @ts-ignore @param {Date |string} date - the new date to set */
  set releaseDate(date) {
    const validationResult = Movie.checkReleaseDate(date);
    if (validationResult instanceof NoConstraintViolation) {
      this._releaseDate = parseDate(date);
    } else {
      throw validationResult;
    }
  }

  /**
   * checks if the given date is of type Date and >= 1895-12-28
   * @param {Date | string} date
   * @returns a ConstraintViolation
   */
  static checkReleaseDate(date) {
    if (!date || date === "") {
      return new NoConstraintViolation();
    } else if (!isDateOrDateString(date)) {
      return new RangeConstraintViolation(
        `The movie's releaseDate must be of type "Date" or a valid date string, but is (${date}: ${typeof date})!`
      );
    } else if (parseDate(date) < new Date("1895-12-28")) {
      return new IntervalConstraintViolation(
        `The movie's releaseDate must be after 1895-12-28, but is ${getRawDate(
          parseDate(date)
        )}!`
      );
    } else {
      return new NoConstraintViolation();
    }
  }

  /** deletes the `releaseDate`of this movie */
  deleteReleaseDate() {
    delete this._releaseDate;
  }

  // *** rating ***************************************************************

  /**
   * @returns {number} the (enum) number of the movie's rating.
   * Use with `MovieRatingEL[rating]`.
   */
  get rating() {
    return this._rating;
  }

  /**
   * checks if the given rating is part of the enum `MovieRatingEL`
   * @param {number | string} rating the (enum) number of the movies rating
   * @returns a ConstraintViolation
   */
  static checkRating(rating) {
    if (!rating) {
      return new NoConstraintViolation(); // optional
    } else if (!isIntegerOrIntegerString(rating)) {
      return new RangeConstraintViolation(
        `The movie's rating must be of type number, but is (${rating}: ${typeof rating})!`
      );
    } else if (
      parseStringInteger(rating) < 1 ||
      parseStringInteger(rating) > MovieRatingEL.MAX
    ) {
      return new IntervalConstraintViolation(
        `The movie's rating (${rating}) is not in the enumeration MovieRatingEL [1,${MovieRatingEL.MAX}]`
      );
    } else {
      return new NoConstraintViolation();
    }
  }

  /** @param {number} rating - the (enum) number of the rating */
  set rating(rating) {
    const validationResult = Movie.checkRating(rating);
    if (validationResult instanceof NoConstraintViolation) {
      this._rating = parseStringInteger(rating);
    } else {
      throw validationResult;
    }
  }

  // *** genre ****************************************************************

  /** @returns {number[]} a list of numbers representing genres in `GenreEL` */
  get genres() {
    return this._genres;
  }

  /**
   * checks if the given genre is part of the enum `GenreEL`
   * @param {number} genre the (enum) number of a movie's genre
   * @returns a ConstraintViolation
   */
  static checkGenre(genre) {
    if (!Number.isInteger(genre)) {
      return new RangeConstraintViolation(
        `The movie's genre must be of type number, but is (${genre}: ${typeof genre})!`
      );
    } else if (genre < 1 || genre > GenreEL.MAX) {
      return new IntervalConstraintViolation(
        `The movie's genre (${genre}) is not in the enumeration MovieRatingEL [1,${GenreEL.MAX}]`
      );
    } else {
      return new NoConstraintViolation();
    }
  }

  /**
   * checks if the given genres are all part of the enum `GenreEL`
   * @param {number[]} genres an array of (enum) numbers of the movie's genres
   * @returns a ConstraintViolation
   */
  static checkGenres(genres) {
    if (!genres || (Array.isArray(genres) && genres.length < 1)) {
      return new MandatoryValueConstraintViolation(
        `The movie must have at least one genre`
      );
    } else if (!Array.isArray(genres)) {
      return new RangeConstraintViolation(
        `The movie's genres must be of type list/array, but is ${typeof genres}`
      );
    } else {
      for (const i of genres.keys()) {
        const validationResult = Movie.checkGenre(genres[i]);
        if (!(validationResult instanceof NoConstraintViolation)) {
          return validationResult;
        }
      }
      return new NoConstraintViolation();
    }
  }

  /** @param {number[]} genres of the movie as numbers from `GenreEL` */
  set genres(genres) {
    const validationResult = Movie.checkGenres(genres);
    if (validationResult instanceof NoConstraintViolation) {
      this._genres = genres;
    } else {
      throw validationResult;
    }
  }

  // *** director *************************************************************

  /** @ts-ignore @returns {Person} the director (`Person`) of the movie */
  get director() {
    return this._director;
  }

  /** @ts-ignore @param {Person | number} director the `Person` or it's `personId` */
  set director(director) {
    const director_id =
      typeof director !== "object" ? director : director.personId;
    const validationResult = Movie.checkDirector(director_id);
    if (validationResult instanceof NoConstraintViolation) {
      // create the new director reference
      this._director = PersonStorage.instances[director_id];
    } else {
      throw validationResult;
    }
  }

  /** @param {number} director_id */
  static checkDirector(director_id) {
    return Person.checkPersonIdAsIdRef(director_id);
  }

  // *** actors ***************************************************************

  /** @ts-ignore @returns {{[key: number]: Person}} a Map of actors (*key = `person.Id`*) starring the movie */
  get actors() {
    return this._actors;
  }

  /** @ts-ignore @param {Person[] | number[] | {[key: number]: Person} | undefined} actors an array of `Person`s or an array of `personId`s or a `Map<personId, Person>` */
  set actors(actors) {
    // clear and add actors
    this._actors = {};
    this.addActors(actors);
  }

  /** @param {number} actor */
  static checkActor(actor) {
    return Person.checkPersonIdAsIdRef(actor);
  }

  /** @param {Person[] | number[] | {[key: number]: Person} | undefined} actors an array of `Person`s or an array of `personId`s or a `Map<personId, Person>` */
  addActors(actors) {
    if (Array.isArray(actors)) {
      // array of IdRefs
      for (let idRef of actors) {
        this.addActor(idRef);
      }
    } else {
      // map of IdRefs to object references
      for (let idRef of Object.keys(actors)) {
        this.addActor(actors[idRef]);
      }
    }
  }

  /** @param {Person | number} actor the `Person` or it's `personId` */
  addActor(actor) {
    // actor can be an ID reference or an object reference
    const actor_id = typeof actor !== "object" ? actor : actor.personId;
    const validationResult = Movie.checkActor(actor_id);
    if (actor_id && validationResult instanceof NoConstraintViolation) {
      // add the new actor reference
      let key = String(actor_id);
      this._actors[key] = PersonStorage.instances[key];
    } else {
      throw validationResult;
    }
  }

  /** @param {Person[] | number[] | {[key: number]: Person} | undefined} actors an array of `Person`s or an array of `personId`s or a `Map<personId, Person>` */
  removeActors(actors) {
    if (Array.isArray(actors)) {
      // array of IdRefs
      for (let idRef of actors) {
        this.removeActor(idRef);
      }
    } else {
      // map of IdRefs to object references
      for (let idRef of Object.keys(actors)) {
        this.removeActor(actors[idRef]);
      }
    }
  }

  /** @param {Person | number} actor the `Person` or it's `personId` */
  removeActor(actor) {
    // a can be an ID reference or an object reference
    const actor_id = typeof actor !== "object" ? actor : actor.personId;
    const validationResult = Movie.checkActor(actor_id);
    if (validationResult instanceof NoConstraintViolation) {
      // delete the actor reference
      delete this._actors[String(actor_id)];
    } else {
      throw validationResult;
    }
  }


  // *** serialization ********************************************************

  /**
   * a static function that creates a `new Movie` from a serialized one.
   * @param {MovieSlots} slots - Object creation slots
   * @returns {Movie | null} a new `Movie` with the corresponding slots if they pass their constraints. `null` otherwise.
   */
  static deserialize(slots) {
    let movie = null;
    try {
      movie = new Movie({
        movieId: slots.movieId,
        title: slots.title,
        rating: slots.rating,
        genres: slots.genres,
        releaseDate: slots.releaseDate,
        director: slots.director,
        actors: slots.actors,
      });
    } catch (e) {
      console.warn(
        `${e.constructor.name} while deserializing a movie: ${e.message}`
      );
      movie = null;
    }
    return movie;
  }

  /**
   * this function is invoked by `JSON.stringify()` and converts the inner `"_propertyKey"` to `"propertyKey"`
   * @override the inherited toJSON()
   * @returns {{}} the JSON object of the movie
   */
  toJSON() {
    const rec = {};
    for (let p of Object.keys(this)) {
      // copy only property slots with underscore prefix
      if (p.charAt(0) !== "_") continue;
      switch (p) {
        case "_director":
          // convert object reference to ID reference
          rec.director = this._director.personId;
          break;
        case "_actors":
          // convert the map of object references to a list of ID references
          rec.actors = [];
          Object.keys(this.actors).forEach((actorIdStr) => {
            rec.actors.push(parseInt(actorIdStr));
          });
          break;
        default:
          // remove underscore prefix
          rec[p.substr(1)] = this[p];
      }
    }
    return rec;
  }

  /** @returns the stringified Movie */
  toString() {
    var actorsString = this._actors ? this._actors.toString() : "";
    var movieStr = `Movie{movieId: ${this.movieId}, title: ${this.title}, releaseDate: ${this._releaseDate ? this.releaseDate.toLocaleDateString() : "undefined"}, director: ${this._director.toString()}`
    return actorsString ? movieStr + ", " +  actorsString : movieStr + "}";
  }
}
