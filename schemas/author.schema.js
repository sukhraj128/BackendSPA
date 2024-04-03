module.exports = {
  "$schema": "http://json-schema.org/draft-04/schema#",
  "title": "Authors",
  "type": "object",
  "properties": {
    "ID": {
      "type": "integer",
      "description": "The unique identifier for an author, automatically incremented."
    },
    "firstName": {
      "type": "string",
      "maxLength": 32,
      "description": "The first name of the author.",
      "minLength": 1
    },
    "lastName": {
      "type": "string",
      "maxLength": 32,
      "description": "The last name of the author.",
      "minLength": 1
    },
    "bio": {
      "type": "string",
      "description": "Biography of the author."
    },
    "profilePicURL": {
      "type": "string",
      "maxLength": 256,
      "description": "URL of the author's profile picture."
    },
    "dateAdded": {
      "type": "string",
      "format": "date-time",
      "description": "The timestamp when the author record was created, defaulting to the current timestamp."
    }
  },
  "required": ["firstName", "lastName"],
  "additionalProperties": false
}