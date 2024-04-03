const {Validator, ValidationError} = require('jsonschema');
const bookschema = require('../schemas/book.schema.js');
const reviewschema = require('../schemas/review.schema.js');
const userschema = require('../schemas/user.schema.js');
const authorSchema = require('../schemas/author.schema.js')
const v = new Validator();

exports.validateArticle = async (ctx, next) => {

  const validationOptions = {
    throwError: true,
    allowUnknownAttributes: false
  };

  const body = ctx.request.body;

  try {
    v.validate(body, bookschema, validationOptions);
    await next();
  } catch (error) {
    if (error instanceof ValidationError) {
      console.error(error);
      ctx.status = 400
      ctx.body = error;  
  } else {
    throw error;
    }
  }
}

exports.validateReview = async (ctx, next) =>{
  const validationOptions ={
    throwError: true,
    allowUnknownAttributes: false
  };

  const body = ctx.request.body;
  try {
    v.validate(body, reviewschema, validationOptions);
    await next();
  } catch (error) {
    if (error instanceof ValidationError) {
      console.error(error);
      ctx.status = 400
      ctx.body = error;  
  } else {
    throw error;

    }
  }
}

exports.validateUser = async (ctx,next) =>{
  const validationOptions ={
    throwError: true,
    allowUnknownAttributes: false
  };

  const body = ctx.request.body;
  try {
    v.validate(body, userschema, validationOptions);
    await next();
  } catch (error) {
    if (error instanceof ValidationError) {
      console.error(error);
      ctx.status = 400
      ctx.body = error;  
  } else {
    throw error;
    }
  }
}
exports.validateAuthor = async (ctx, next) => {
  const validationOptions = {
    throwError: true,
    allowUnknownAttributes: false
  };

  const body = ctx.request.body;

  try {
    v.validate(body, authorSchema, validationOptions);
    await next();
  } catch (error) {
    if (error instanceof ValidationError) {
      console.error(error);
      ctx.status = 400;
      ctx.body = error;
    } else {
      throw error;
    }
  }
}; 


