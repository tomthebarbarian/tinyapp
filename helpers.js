const bcrypt = require('bcryptjs');

// returns the user object by if email and password are correct,
// or only email if only the email is correct
// or false if user doesn't exist.
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

// returns object containing url object where userID === id
// or an empty object if no urls belong to the user
const urlsForUser = (id, searchData) => {
  const ansObj = {};
  for (let elem in searchData) {
    if (searchData[elem].userID === id) {
      ansObj[elem] = searchData[elem];
    }
  }
  return ansObj;
};

module.exports = {userfinder, urlsForUser};