const express = require("express");
const bodyParser = require("body-parser");
const app = express();
const PORT = 8080;

app.set("view engine", "ejs");


//


app.use(bodyParser.urlencoded({extended: true}));

const generateRandomString = function() {
  return Math.random().toString(36).substring(2, 8);
};

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

// Requests

// just read the db
app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

// Making a new short url
app.get("/urls/new", (req, res) => {
  // if not logged in
  const pass = false;
  if (pass) {
    console.log('login');
    res.redirect('/login');
  }

  res.render("urls_new");
 
});


// Extra info for a specific short url
app.get("/urls/:shortURL", (req, res) => {
  res.redirect(urlDatabase[req.params.shortURL]);

  // const templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL] };
  // res.render('urls_show', templateVars);
  // res.json(urlDatabase);
  // res.redirect(templateVars.longURL);
});




// add a url
app.post("/urls", (req, res) => {
  // if not logged in
  const pass = '';
  if (pass) {
    res.redirect('/loginerr');
  }
  let currLong = req.body.longURL;
  console.log(currLong);  // Log the POST request body to the console
  const currShort = generateRandomString();
  
  // res.send(currShort);
  res.status = 200;      // Respond with 'Ok' (we will replace this)
  urlDatabase[currShort] = currLong;
  res.redirect(`/urls/${currShort}`);
});

// see url list
app.get("/urls", (req, res) => {
  const templateVars = { urls: urlDatabase};
  res.render('urls_index', templateVars);
  // res.json(urlDatabase);
});


// redirect to appropriate start page
app.get("/", (req, res) => {
  // res.send("Hello!");
  res.redirect('/urls');
  // if not logged in
  const pass = '';
  if (pass) {
    res.redirect('/login');
  }
});

// if 404 err
if (app.status === 404) {
  return '404 error';
}

// Server listening;
app.listen(PORT);
console.log(`listening at ${PORT}`);