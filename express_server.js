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
      if (bcrypt.compareSync(password, pass)) {
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

  if (user_id === undefined) {
    res.status(403);
    res.redirect('/login');
  }

  const vals = {
    username: users[user_id].email,
  };

  res.render("urls_new", vals);
});

// delete a short url entry
app.post("/urls/:shortURL/delete", (req, res) => {
  const {user_id} = req.session;
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
  const {user_id} = req.session;
  if (user_id === undefined) {
    res.status(403);
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
  const {user_id} = req.session;
  if (req.session.user_id === undefined) {
    res.status(403);
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
  const {user_id} = req.session;
  
  // console.log(username);
  if (user_id === undefined) {
    res.status(403);
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
  // console.log('in urls', req.session);
  // not logged in
  const user_id = req.session.user_id;

  // console.log('here is cookie id ', req.session.user_id);

  const usersUrls = urlsForUser(user_id, urlDatabase);
  console.log('main urls', user_id);

  if (req.session.user_id === undefined) {
    console.log('url list need to log in again');
    // res.redirect('/login');
    const templateVars = {
      username: undefined,
      urls: usersUrls,
      cond: 'Must be logged in to see urls',
    };
    res.status(403);
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
  // console.log(req.session);
});


// redirect to appropriate start page
app.get("/", (req, res) => {
  // let cursession = req.session;
  console.log(req.session.user_id);
  if (req.session.user_id !== undefined) {
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
  // console.log(req.session);
  let loginstatus = {};
  loginstatus.cond = req.params.login;
  loginstatus.username = req.session.user_id;
  // console.log('can we do cookies?', req.session);
  if (loginstatus.username === undefined) {
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
  // console.log(currUser);

  if (typeof  currUser === 'object') {
    // console.log('login params',req.params);
    // console.log('login body',req.body);

    req.session.user_id = currUser.id
    // res.cookie('user_id',currUser.id);
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
  
  // console.log('in register now');
<<<<<<< HEAD
  let loginstatus = {
    cond: undefined,
    username: undefined,
  };
=======
  let loginstatus = {};
  loginstatus.cond = req.params.login;
  loginstatus.username = users[user_id];
>>>>>>> 0764131 (implemented hash password checking)

  if (req.session.user_id === undefined) {
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
    pass : bcrypt.hashSync(pass, 10),
    email: username,
  };
  // console.log(users);
  req.session.user_id = curruid;
  console.log('here is cookie id ', req.session.user_id);
  res.redirect('/urls');

  // res.redirect('/urls');
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


