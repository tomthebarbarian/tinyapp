const express = require("express");
const bodyParser = require("body-parser");
const cookieParser = require('cookie-parser');

const app = express();
const PORT = 8080;

app.set("view engine", "ejs");
app.use(cookieParser());

//


app.use(bodyParser.urlencoded({extended: true}));

const generateRandomString = function() {
  return Math.random().toString(36).substring(2, 8);
};


const users = {
  tomthebarb: {
    pass:'password',
    urls:{
      "b2xVn2": "http://www.lighthouselabs.ca",
      "9sm5xK": "http://www.google.com",
    }
  },
  russetyellows: {},
  theTankMan: {},
};
// const urlDatabase = {
//   "b2xVn2": "http://www.lighthouselabs.ca",
//   "9sm5xK": "http://www.google.com",
// };

let currentUser = 'tomthebarb';

let urlDatabase = users[currentUser].urls;


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
  const vals = {
    username: req.cookies.username
  };
  res.render("urls_new", vals);
});

// delete a short url entry
app.post("/urls/:shortURL/delete", (req, res) => {
  
  // res.redirect(urlDatabase[req.params.shortURL]);

  const currShort = req.params.shortURL;
  delete urlDatabase[currShort];

  // res.json(urlDatabase);
  console.log('urls delete');
  res.redirect("/urls");
});


// Extra info for a specific short url
// app.get("/urls/:shortURL", (req, res) => {
  
//   // res.redirect(urlDatabase[req.params.shortURL]);

//   const templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL] };
//   res.render('urls_show', templateVars);
// });


// Individidual short address pages

app.get("/urls/:ids", (req, res) => {
  // if not logged in
  if (req.cookies.username === undefined) {
    res.redirect('/login');
  }
  // console.log('curr urlids params',req.params);
  // console.log('curr  body',req.body);
  // console.log('url db', urlDatabase);
  const templateVars = {
    username: req.cookies.username,
    shortURL: req.params.ids,
    longURL: urlDatabase[req.params.ids],
  };
  res.render('urls_show', templateVars);
});


// Update an individual page for an id
app.post("/urls/:id", (req, res) => {
  // if not logged in
  if (req.cookies.username === undefined) {
    res.redirect('/login');
  }
  urlDatabase[req.params.id] = req.body.updateURL;
  // console.log('curr params',req.params);
  // console.log('curr body',req.body);
  // console.log('url db', urlDatabase);
  res.redirect(`/urls/${req.params.id}`);
});

// Redirect based on short address.
app.get("/u/:id", (req, res) => {
  // if not logged in
  if (req.cookies.username === undefined) {
    res.redirect('/login');
  }
  let currLong = urlDatabase[req.params.id];
  // console.log('past promise');
  if (currLong !== undefined) {
    console.log('currLong', currLong);
    console.log(urlDatabase);
    res.redirect(`${currLong}`);
    
  }
});


// add a url
app.post("/urls", (req, res) => {
  // if not logged in
  if (req.cookies.username === undefined) {
    res.redirect('/login');
  }
  let currLong = req.body.longURL;
  // console.log("The Current long",currLong);  // Log the POST request body to the console
  const currShort = generateRandomString();
  urlDatabase[currShort] = currLong;
  res.redirect(`/urls/${currShort}`);
});

// see url list
app.get("/urls", (req, res) => {
  // console.log('in urls', req.cookies);
  if (req.cookies.username === undefined) {
    console.log('need to log in again');
    res.redirect('/login');
  }
  // console.log(req.cookies.username);
  let currUrls = users[req.cookies.username];
  if (currUrls === undefined) {
    currUrls = {};
  } else {
    currUrls = currUrls.urls;
  }
  const templateVars = {
    username: req.cookies.username,
    urls: currUrls,
  };
  res.render('urls_index', templateVars);
  // res.json(urlDatabase);
  // console.log(req.cookies);
});


// redirect to appropriate start page
app.get("/", (req, res) => {

  if (req.cookies.username !== undefined) {
    res.redirect('/urls');
  }
  // if not logged in
  res.redirect('/login');
  // res.send("Hello!");
  
});

// Log in and Register
app.get('/login', (req, res) => {
  // if logged in
  // console.log('login', req.params);
  let loginstatus = {};
  loginstatus.cond = req.params.login;
  loginstatus.username = req.cookies.username;
  // console.log('can we do cookies?', req.cookies);
  if (req.cookies.username === undefined) {
    // console.log('rendering login');
    res.render('urls_login', loginstatus);
    return;
  }
  // console.log('also going to urls?');
  res.redirect('/urls');
});

app.post('/login', (req, res) => {
  // if logged in
  // console.log(req.body);
  // console.log(users[req.body.username].pass);
  if (req.body.pass === users[req.body.username].pass) {

    // console.log('login params',req.params);
    // console.log('login body',req.body);
    res.cookie('username',req.body.username);
    res.redirect('/urls');
    return;
  }
  const loginstatus = {
    cond:'wrong username or password'
  };
  res.render('urls_login',loginstatus);
});

// new user
app.post('/register', (req, res) => {
  users[req.name]['password'] = 'encryptedpass';
  res.redirect('/urls');
});

// delete cookie
app.post('/logout', (req, res) => {
  // if logged in
  res.clearCookie('username');
  res.redirect('/login');
});




// if 404 err
if (app.status === 404) {
  return '404 error';
}


// Server listening;
app.listen(PORT);
console.log(`listening at ${PORT}`);
