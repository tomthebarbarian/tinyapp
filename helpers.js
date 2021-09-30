const bcrypt = require('bcryptjs');

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

module.exports = {userfinder, urlsForUser};