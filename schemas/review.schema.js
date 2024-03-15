module.exports = {
  "$schema": "http://json-schema.org/draft-04/schema#",
  "title": "Review",
  "type": "object",
  "properties": {
    "UserID": {
      "type": "integer",
      "description": "The unique identifier for a user, representing the author of the review."
    },
    "BookID": {
      "type": "integer",
      "description": "The unique identifier for a book, representing the book being reviewed."
    },
    "Rating": {
      "type": "number",
      "minimum": 0,
      "maximum": 5,
      "description": "The rating given to the book by the user, ranging from 0 to 5."
    },
    "ReviewText": {
      "type": "string",
      "description": "The text of the review provided by the user."
    },
    "CreatedAt": {
      "type": "string",
      "format": "date-time",
      "description": "The timestamp when the review was created. This field is auto-generated by the database and defaults to the current timestamp."
    }
  },
  "required": ["BookID", "Rating", "ReviewText"],
  "additionalProperties": false
}