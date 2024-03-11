// This file will define the API route handlers for Articles
const Router = require('koa-router');  

// We are going to parse request bodies so import koa-bodyparser
const bodyParser = require('koa-bodyparser');  

// Since we are handling articles use a URI that begins with an appropriate path
const router = Router({prefix: '/api/v1/articles'});


// Temporarily define some random articles in an array.
// Later this will come from the DB.

let articles = [
  {title:'hello article', fullText:'some text here to fill the body'},
  {title:'another article', fullText:'again here is some text here to fill'},
  {title:'coventry university ', fullText:'some news about coventry university'}
];  


// Routes are needed to connect path endpoints to handler functions.
// When an Article id needs to be matched we use a pattern to match
// a named route parameter. Here the name of the parameter will be 'id'
// and we will define the pattern to match at least 1 numeral.

router.get('/', getAll);  
router.post('/', bodyParser(), createArticle);  

router.get('/:id([0-9]{1,})', getById);
router.put('/:id([0-9]{1,})', updateArticle);  
router.del('/:id([0-9]{1,})', deleteArticle);  


// Now we define the handler functions used above.

function getAll(cnx, next){  
  // Use the response body to send the articles as JSON.
  cnx.body = articles;  
}  

function getById(cnx, next){
  // Get the ID from the route parameters.
  let id = cnx.params.id;  

  // If it exists then return the article as JSON.
  // Otherwise return a 404 Not Found status code
  if ((id < articles.length+1) && (id > 0)) {
    cnx.body = articles[id-1];
  } else {
    cnx.status = 404;
  }
}

function createArticle(cnx, next) {
  // The body parser gives us access to the request body on cnx.request.body.
  // Use this to extract the title and fullText we were sent.
  let {title, fullText} = cnx.request.body;
  // In turn, define a new article for addition to the array.
  let newArticle = {title:title, fullText:fullText};
  articles.push(newArticle);
  // Finally send back appropriate JSON and status code.
  // Once we move to a DB store, the newArticle sent back will now have its ID.
  cnx.status = 201;
  cnx.body = newArticle;
}  

function updateArticle(cnx, next){ 
   
  //TODO: edit an article  
}  

function deleteArticle(cnx, next){  
  //TODO: delete an article  
}  

// Finally, define the exported object when 'require'd from other scripts. 
module.exports = router;

