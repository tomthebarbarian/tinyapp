# tinyapp
LHL first marked project, url shortener tinyapp

## Requirements

### Display DONE

Site Header:
if a user is logged in, the header shows:
Done the user's email
Done a logout button which makes a POST request to /logout

if a user is not logged in, the header shows:
Done a link to the login page (/login)
Done  a link to the registration page (/register)

### Behavior

#### GET / DONE

if user is logged in:
(Minor) redirect to /urls * DONE
if user is not logged in:
(Minor) redirect to /login DONE

#### GET /urls DONE BUT STRETCH

if user is logged in: DONE
returns HTML with:
the site header (see Display Requirements above)
a list (or table) of URLs the user has created, each list item containing:
a short URL
the short URL's matching long URL DONE

an edit button which makes a GET request to /urls/:id Done

a delete button which makes a POST request to /urls/:id/delete Done

##### Stretch
(Stretch) the date the short URL was created

(Stretch) the number of times the short URL was visited

(Stretch) the number of unique visits for the short URL

(Minor) a link to "Create a New Short Link" which makes a GET request to /urls/new DONE

if user is not logged in:
returns HTML with a relevant error message DONE

#### GET /urls/new DONE

if user is logged in:
returns HTML with:
the site header (see Display Requirements above)

a form which contains:
a text input field for the original (long) URL DONE
a submit button which makes a POST request to /urls DONE
if user is not logged in:

redirects to the /login page DONE

#### GET /urls/:id DONE BUT STRETCH
if user is logged in and owns the URL for the given ID: DEONE
returns HTML with:
the site header (see Display Requirements above) DONE
the short URL (for the given ID)
a form which contains:
the corresponding long URL DONE
an update button which makes a POST request to /urls/:id DONE

(Stretch) the date the short URL was created
(Stretch) the number of times the short URL was visited
(Stretch) the number of unique visits for the short URL

if a URL for the given ID does not exist:
(Minor) returns HTML with a relevant error message DONE

if user is not logged in:
returns HTML with a relevant error message DONE

if user is logged it but does not own the URL with the given ID:
returns HTML with a relevant error message DONE

#### GET /u/:id DONE BUT MINOR

if URL for the given ID exists:
redirects to the corresponding long URL DONE

if URL for the given ID does not exist:
(Minor) returns HTML with a relevant error message

#### POST /urls DONE BUT MINOR

if user is logged in: Done
generates a short URL, saves it, and associates it with the user DONE
redirects to /urls/:id, where :id matches the ID of the newly saved URL DONE
if user is not logged in:
(Minor) 
returns HTML with a relevant error message

#### POST /urls/:id DONE BUT MINOR

if user is logged in and owns the URL for the given ID:
updates the URL DONE
redirects to /urls DONE

if user is not logged in:
(Minor) returns HTML with a relevant error message

if user is logged it but does not own the URL for the given ID:
(Minor) returns HTML with a relevant error message

#### POST /urls/:id/delete DONE BUT MINOR
if user is logged in and owns the URL for the given ID:
deletes the URL DONE
redirects to /urls DONE
if user is not logged in:
(Minor) returns HTML with a relevant error message
if user is logged it but does not own the URL for the given ID:
(Minor) returns HTML with a relevant error message

#### GET /login DONE 

if user is logged in:
(Minor) redirects to /urls DONE
if user is not logged in:
returns HTML with:
a form which contains:
input fields for email and password DONE
submit button that makes a POST request to /login DONE


### GET /register DONE

if user is logged in:
(Minor) redirects to /urls DONE
if user is not logged in:

returns HTML with:
a form which contains:
input fields for email and password DONE
a register button that makes a POST request to /register DONE

#### POST /login DONE

if email and password params match an existing user:
sets a cookie
redirects to /urls
if email and password params don't match an existing user: 
returns HTML with a relevant error message

#### POST /register DONE

if email or password are empty:
returns HTML with a relevant error message DONE

if email already exists:
returns HTML with a relevant error message DONE
otherwise:

creates a new user
encrypts the new user's password with bcrypt DONE

sets a cookie DONE
redirects to /urls

#### POST /logout DONE

deletes cookie DONE
redirects to /urls DONE