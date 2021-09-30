const express = require("express");
const bodyParser = require("body-parser");
const cookieSession = require('cookie-session');
const morgan = require('morgan');
const uuid = require('uuid');
const bcrypt = require('bcryptjs');

const app = express();
const PORT = 8080;

app.set("view engine", "ejs");

app.use(cookieSession({
  name: 'session',
  keys: ['key1', 'key2'],
  maxAge: 24 * 60 * 60 * 1000 // 24 hours

}));

morgan('tiny');

// Logged in check
// if cookie doesn't exist go back to login page.
app.use((req, res, next) => {
  const {user_id} = req.session;
  const path = req.path;
  if (
    user_id === undefined &&
    path !== '/login' &&
    path !== '/register'
  ) {
    res.status(403);
    res.redirect('/login');
  }
  next();
});



app.use(bodyParser.urlencoded({extended: true}));


// Helpers
const generateRandomString = () => uuid.v4().substr(0,6);

// Find if user and pass of input are equivalent to values in
const {userfinder, urlsForUser} = require('./helpers');


// Constants
// usersobj
const users = {
  'xckdkl': {
    pass:bcrypt.hashSync('password', 10),//password
    id:'xckdkl',
    email: 'me@we.com',
  },
  'slkdls': {
    id: 'slkdls',
    pass: 'qwerty',
    email: 'abc@123.com',
  },
  'abcdef': {
    id: 'abcdef',
    pass: 'asdfg',
    email: '123@123.com',

  },
};
// urls obj
const urlDatabase = {
  "b2xVn2": {
    longURL: "http://www.lighthouselabs.ca",
    userID: 'xckdkl'
  },
  "9sm5xK": {
    longURL: "http://www.google.com",
    userID: 'xckdkl',
  },
};

// Server listening;
app.listen(PORT);
console.log(`listening at ${PORT}`);

// Requests
// just read the db
app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

// Making a new short url
app.get("/urls/new", (req, res) => {
  // if not logged in
  const {user_id} = req.session;
  const templateVars = {
    username: users[user_id].email,
  };
  res.render("urls_new", templateVars);
});

// delete a short url entry
app.post("/urls/:shortURL/delete", (req, res) => {
  const {user_id} = req.session;
  const currShort = req.params.shortURL;
  if (urlDatabase[currShort].userID === user_id) {
    delete urlDatabase[currShort];
  }
  res.redirect("/urls");
});


// Individidual short address pages
app.get("/urls/:ids", (req, res) => {
  // Display url
  const {user_id} = req.session;

  const templateVars = {
    username: users[user_id].email,
    shortURL: req.params.ids,
    longURL: urlDatabase[req.params.ids].longURL,
  };
  res.render('urls_show', templateVars);
});


// Update an individual page for an id
app.post("/urls/:id", (req, res) => {
  // if not logged in
  const {user_id} = req.session;
  if (urlDatabase[req.params.id].userID === user_id) {
    urlDatabase[req.params.id].longURL = req.body.updateURL;
  }
  res.redirect(`/urls/${req.params.id}`);
});

// Redirect based on short address.
app.get("/u/:id", (req, res) => {
  let currLong = urlDatabase[req.params.id].longURL;
  if (currLong !== undefined) {
    console.log('currLong', currLong);
    console.log(urlDatabase);
    res.redirect(`${currLong}`);
  }
});


// add a url
app.post("/urls", (req, res) => {
  const currShort = generateRandomString();
  const {user_id} = req.session;
  let currLong = req.body.longURL;
  urlDatabase[currShort] = {
    longURL: currLong,
    userID: user_id,
  };
  res.redirect(`/urls/${currShort}`);
});

// see url LIST
app.get("/urls", (req, res) => {
  // not logged in
  const user_id = req.session.user_id;
  const usersUrls = urlsForUser(user_id, urlDatabase);
  if (req.session.user_id === undefined) {
    const templateVars = {
      username: undefined,
      urls: usersUrls,
      cond: 'Must be logged in to see urls',
    };
    res.status(403);
    res.render('urls_index', templateVars);
    return;
  }
  // Display urls
  const templateVars = {
    username: users[user_id].email,
    urls: usersUrls,
    cond: undefined,
  };
  res.render('urls_index', templateVars);
});


// redirect to appropriate start page
app.get("/", (req, res) => {
  // let cursession = req.session;
  console.log(req.session.user_id);
  if (req.session.user_id !== undefined) {
    // console.log('starturls');
    res.redirect('/urls');
    return;
  }
  // if not logged in
  console.log('start login');
  res.redirect('/login');
  // res.send("Hello!");
  
});

// Log in and Register

// just login
app.get('/login', (req, res) => {
  let loginstatus = {};
  loginstatus.cond = req.params.login;
  loginstatus.username = req.session.user_id;
  // console.log('can we do cookies?', req.session);
  if (loginstatus.username === undefined) {
    res.render('urls_login', loginstatus);
    return;
  }
  res.redirect('/urls');
});


app.post('/login', (req, res) => {
  // if logged in
  const {username, pass} = req.body;
  // case1
  const currUser = userfinder(username, pass, users);

  if (typeof  currUser === 'object') {
    req.session.user_id = currUser.id;
    res.redirect('/urls');
    return;
  }
  // case4
  const loginstatus = {
    cond:'wrong username or password',
    username: undefined
    
  };
  res.status(403);
  res.render('urls_login',loginstatus);
});

// new user
app.get('/register', (req, res) => {
  let loginstatus = {
    cond: undefined,
    username: undefined,
  };
  if (req.session.user_id === undefined) {
    res.render('urls_register', loginstatus);
    return;
  }
  res.redirect('/urls');
});

// register post
app.post('/register', (req, res) => {
  // console.log(req.body);
  const loginstatus = {
    cond:'Existing User',
    username: undefined
  };
  let {username, pass} = req.body;

  const existing = userfinder(username, pass, users);
  let curruid = generateRandomString();

  if (existing) {
    res.render('urls_register',loginstatus);
    return;
  }
  if (username.length < 1) {
    loginstatus.cond = 'Email is empty';
    res.status(400);
    res.render('urls_register',loginstatus);
    return;
  }
  if (pass.length < 1) {
    loginstatus.cond = 'Password is empty';
    res.status(400);
    res.render('urls_register',loginstatus);
    return;
  }
  users[curruid] = {
    id: curruid,
    pass : bcrypt.hashSync(pass, 10),
    email: username,
  };
  req.session.user_id = curruid;
  res.redirect('/urls');
});

// delete cookie
app.post('/logout', (req, res) => {
  // if logged in
  req.session = null;
  res.redirect('/login');
});

// if 404 err
if (app.status === 404) {
  return '404 error';
}


