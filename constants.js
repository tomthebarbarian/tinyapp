// Constants
// usersobj
const bcrypt = require('bcryptjs');
const users = {
  'xckdkl': {
    pass:bcrypt.hashSync('password', 10),//password
    id:'xckdkl',
    email: 'me@we.com',
  },
  'slkdls': {
    id: 'slkdls',
    pass: bcrypt.hashSync('qwerty', 10),
    email: 'abc@123.com',
  },
  'abcdef': {
    id: 'abcdef',
    pass: bcrypt.hashSync('asdfg',10),
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

module.exports = {users, urlDatabase};