const express = require("express");
const bodyParser = require("body-parser");
const cookieParser = require('cookie-parser');
const morgan = require('morgan');
const uuid = require('uuid');

const app = express();
const PORT = 8080;

app.set("view engine", "ejs");
app.use(cookieParser());
// app.use(morgan);

morgan('tiny');


app.use(bodyParser.urlencoded({extended: true}));


// Helpers


const generateRandomString = () => uuid.v4().substr(0,6);

// Find if user and pass of input are equivalent to values in
// user db
const userfinder = (user, password, searchData) => {
  for (let elem in searchData) {
    let {email, pass} = searchData[elem];
    // if both user and pass
    if (email === user) {
      // return true;
      if (pass === password) {
        return searchData[elem];
      }
      return 'onlyemail';
    }
  }
  return false;
};

// returns object only containing url objects where userID === id
const urlsForUser = (id, searchData) => {
  const ansObj = {};
  for (let elem in searchData) {
    if (searchData[elem].userID === id) {
      ansObj[elem] = searchData[elem];
    }
  }
  return ansObj;
};

// shorturls access
// const urlfinder = (id, comparison, searchData) => {
//   for (let elem in searchData) {
//     if (elem === id) {
//       // return true;
//       if (searchData[id][comparison] = )
//       return searchData[elem];
//     } else {
//       return false;
//     }
//   }
// };

// Constants


const users = {
  'xckdkl': {
    pass:'password',
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
  const {user_id} = req.cookies;

  if (user_id === undefined) {
    res.redirect('/login');
  }

  const vals = {
    username: users[user_id].email,
  };

  res.render("urls_new", vals);
});

// delete a short url entry
app.post("/urls/:shortURL/delete", (req, res) => {
  const {user_id} = req.cookies;
  // res.redirect(urlDatabase[req.params.shortURL]);
  const currShort = req.params.shortURL;
  // console.log('logged in', user_id);
  // console.log('ownerid', (urlDatabase[currShort].userID));
  if (urlDatabase[currShort].userID === user_id) {
    delete urlDatabase[currShort];
  }
  // console.log(currShort);

  // fix here
  // res.json(urlDatabase);
  // console.log('urls delete');
  res.redirect("/urls");
});


// Individidual short address pages

app.get("/urls/:ids", (req, res) => {
  // if not logged in
  const {user_id} = req.cookies;
  if (user_id === undefined) {
    res.redirect('/login');
  }
  // console.log('curr urlids params',req.params);
  // console.log('curr  body',req.body);
  console.log('id of url',req.params);
  // console.log('url db', urlDatabase);
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
  const user_id = req.cookies;
  if (req.cookies.user_id === undefined) {
    res.redirect('/login');
  }
  if (urlDatabase[req.params.id].userID === user_id) {
    urlDatabase[req.params.id].longURL = req.body.updateURL;
  }
  // console.log('curr params',req.params);
  // console.log('curr body',req.body);
  // console.log('url db', urlDatabase);
  res.redirect(`/urls/${req.params.id}`);
});

// Redirect based on short address.
app.get("/u/:id", (req, res) => {
  let currLong = urlDatabase[req.params.id].longURL;
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
  const {user_id} = req.cookies;
  // console.log(username);
  if (user_id === undefined) {
    res.redirect('/login');
  }
  const currShort = generateRandomString();
  let currLong = req.body.longURL;
  urlDatabase[currShort] = {
    longURL: currLong,
    userID: user_id,
  };
  res.redirect(`/urls/${currShort}`);
});

// see url LIST
app.get("/urls", (req, res) => {
  // console.log('in urls', req.cookies);
  // not logged in
  const {user_id} = req.cookies;
  const usersUrls = urlsForUser(user_id, urlDatabase);
  if (req.cookies.user_id === undefined) {
    console.log('need to log in again');
    // res.redirect('/login');
    const templateVars = {
      username: users[user_id].email,
      urls: usersUrls,
      cond: 'Must be logged in to see urls',
    };
    res.render('urls_index', templateVars);
    return;
  }
  // console.log(user_id);
  console.log('/urls/',usersUrls);

  const templateVars = {
    username: users[user_id].email,
    urls: usersUrls,
    cond: undefined,
  };
  res.render('urls_index', templateVars);
  // res.json(urlDatabase);
  // console.log(req.cookies);
});


// redirect to appropriate start page
app.get("/", (req, res) => {

  if (req.cookies.user_id !== undefined) {
    console.log('starturls');
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
  // if logged in
  // console.log('login', req.params);
  // try with flag
  let loginstatus = {};
  loginstatus.cond = req.params.login;
  loginstatus.username = req.cookies.user_id;
  // console.log('can we do cookies?', req.cookies);
  if (req.cookies.user_id === undefined) {
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
  const {username, pass} = req.body;

  // case1
  const currUser = userfinder(username, pass, users);


  if (typeof  currUser === 'object') {
    // console.log('login params',req.params);
    // console.log('login body',req.body);
    res.cookie('user_id',currUser.id);
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
  const {user_id} = req.cookies;
  // console.log('in register now');
  let loginstatus = {};
  loginstatus.cond = req.params.login;
  loginstatus.username = users[user_id].email;

  if (req.cookies.user_id === undefined) {
    res.render('urls_register', loginstatus);
    return;
  }
  res.redirect('/urls');
});

// register post
app.post('/register', (req, res) => {
  console.log(req.body);
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
    pass,
    email: username,
  };
  console.log(users);
  res.cookie('user_id',curruid);
  res.redirect('/urls');

  // res.redirect('/urls');
});

// delete cookie
app.post('/logout', (req, res) => {
  // if logged in
  res.clearCookie('user_id');
  res.redirect('/login');
});

// if 404 err
if (app.status === 404) {
  return '404 error';
}


