module.exports = {
  "$schema": "http://json-schema.org/draft-04/schema#",
  "title": "Books",
  "type": "object",
  "properties": {
    "BookID": {
      "type": "integer",
      "description": "The unique identifier for a book, automatically incremented."
    },
    "Title": {
      "type": "string",
      "maxLength": 255,
      "description": "The title of the book.",
      "minLength": 1
    },
    "AuthorID": {
      "type": "integer",
      "description": "The unique identifier for the author of the book."
    },
    "PublicationYear": {
      "type": "string",
      "pattern": "^[0-9]{4}$",
      "description": "The year the book was published."
    },
    "Genre": {
      "type": "string",
      "maxLength": 100,
      "description": "The genre of the book."
    },
    "CreatedAt": {
      "type": "string",
      "format": "date-time",
      "description": "The timestamp when the book record was created, defaulting to the current timestamp."
    },
    "imageURL":{
      "type": "string",
      "maxLength": 2048,
      "description": "Image URL of Cover"
    }
  },
  "required": ["Title", "AuthorID"],
  "additionalProperties": false
}