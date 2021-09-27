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

// just read the db
app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.post("/urls", (req, res) => {
  let currLong = req.body.longURL;
  console.log(currLong);  // Log the POST request body to the console
  const currShort = generateRandomString();
  
  // res.send(currShort);
  res.status = 200;      // Respond with 'Ok' (we will replace this)
  urlDatabase[currShort] = currLong;
  res.redirect(`/urls/${currShort}`);
});

app.get("/urls", (req, res) => {
  const templateVars = { urls: urlDatabase};
  res.render('urls_index', templateVars);
  // res.json(urlDatabase);
});

app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

// app.get("/urls/:shortURL", (req, res) => {
//   res.redirect(longURL);
// });

app.get("/urls/:shortURL", (req, res) => {
  res.redirect(urlDatabase[req.params.shortURL]);

  const templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL] };
  // res.render('urls_show', templateVars);
  // res.json(urlDatabase);
  // res.redirect(templateVars.longURL);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});
