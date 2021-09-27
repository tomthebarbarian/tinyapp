const express = require("express");
const bodyParser = require("body-parser");
const app = express();
const PORT = 8080;

app.set("view engine", "ejs");


app.use(bodyParser.urlencoded({extended: true}));

const generateRandomString = function() {
  return Math.random().toString(36).substring(2, 8);
};

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

app.get("/", (req, res) => {
  res.send("Hello!");

});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.post("/urls", (req, res) => {
  console.log(req.body);  // Log the POST request body to the console
  res.send(generateRandomString());
  res.status = 200;      // Respond with 'Ok' (we will replace this)
});

app.get("/urls", (req, res) => {
  const templateVars = { urls: urlDatabase};
  res.render('urls_index', templateVars);
  // res.json(urlDatabase);
});

app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

app.get("/urls/:shortURL", (req, res) => {
  const templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL] };
  res.render('urls_show', templateVars);
  // res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});


app.get("/set", (req, res) => {
  const a = 1;
  res.send(`a = ${a}`);
});
 
// app.get("/fetch", (req, res) => {
//   res.send(`a = ${a}`);
// });