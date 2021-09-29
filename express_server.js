const express = require("express");
const bodyParser = require("body-parser");
const cookieParser = require('cookie-parser');
const morgan = require('morgan');
const uuid = require('uuid');


const app = express();
const PORT = 8080;

app.set("view engine", "ejs");
app.use(cookieParser());
app.use(morgan);

//


app.use(bodyParser.urlencoded({extended: true}));


// Helpers


const generateRandomString = uuid.v4().substr(0,6);

// function() {
//   return Math.random().toString(36).substring(2, 8);
// };

const authIdfinder = (id, searchData) => {
  for (let elem in searchData) {
    if (elem === id) {
      return true;
    } else {
      return false;
    }
  }
};

// Constants

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
  const {username} = req.cookies;

  if (username === undefined) {
    res.redirect('/login');
  }

  const vals = {
    username
  };

  res.render("urls_new", vals);
});

// delete a short url entry
app.post("/urls/:shortURL/delete", (req, res) => {
  
  // res.redirect(urlDatabase[req.params.shortURL]);

  const currShort = req.params.shortURL;
  delete urlDatabase[currShort];

  // fix here
  delete users[currShort].urls;

  // res.json(urlDatabase);
  console.log('urls delete');
  res.redirect("/urls");
});


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
  const {username} = req.cookies;
  // console.log(username);
  if (username === undefined) {
    res.redirect('/login');
  }
  // console.log('extracting correct', users[username]);

  if (users[username].urls === undefined) {
    // console.log('instide post urls', users[username]);
    users[username].urls = {};
  }
  urlDatabase = users[username].urls;

  let currLong = req.body.longURL;
  // console.log("The Current long",currLong);  // Log the POST request body to the console
  const currShort = generateRandomString();
  urlDatabase[currShort] = currLong;
  res.redirect(`/urls/${currShort}`);
});

// see url list
app.get("/urls", (req, res) => {
  // console.log('in urls', req.cookies);
  const {username} = req.cookies;
  if (req.cookies.username === undefined) {
    console.log('need to log in again');
    res.redirect('/login');
  }
  // console.log(username);
  console.log('/urls/',users);
  // console.log(users[username]);
  let currUrls = users[username];

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
  // try with flag
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
  const {username} = req.body;

  if (!Object.keys(users).includes(username)) {
    const loginstatus = {
      cond:'username does not exist',
      username: undefined
    };
    res.render('urls_login',loginstatus);
    return;
  }

  if (!Object.keys(users).includes(username)) {
    const loginstatus = {
      cond:'username does not exist',
      username: undefined
    };
    res.render('urls_login',loginstatus);
    return;
  }

  if (req.body.pass === users[username].pass) {
    // console.log('login params',req.params);
    // console.log('login body',req.body);
    res.cookie('username',username);
    res.redirect('/urls');
    return;
  }
  const loginstatus = {
    cond:'wrong username or password',
    username: undefined
  };
  res.render('urls_login',loginstatus);
});

// new user
app.get('/register', (req, res) => {
  // console.log('in register now');
  let loginstatus = {};
  loginstatus.cond = req.params.login;
  loginstatus.username = req.cookies.username;

  if (req.cookies.username === undefined) {
    res.render('urls_register', loginstatus);
    return;
  }
  res.redirect('/urls');
});

// register post
app.post('/register', (req, res) => {
  console.log(req.body);
  const loginstatus = {
    cond:'Existing Username',
    username: undefined
  };
  let {username, pass} = req.body;

  if (Object.keys(users).includes(req.body.username)) {
    res.render('urls_register',loginstatus);
    return;
  }
  if (username.length < 1) {
    loginstatus.cond = 'Username is empty';
    res.render('urls_register',loginstatus);
    return;
  }
  if (pass.length < 1) {
    loginstatus.cond = 'Password is empty';
    res.render('urls_register',loginstatus);
    return;
  }

  users[username] = {pass};
  console.log(users);
  res.cookie('username',req.body.username);
  res.redirect('/urls');

  // res.redirect('/urls');
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
