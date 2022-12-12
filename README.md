# FULL Stack project: React frontend + express backend

### Intro

* This application was developed for the Hot Yoga studio Ghent. The general idea is to make a private connection between the athlete and the coach, where:
  - The coach creates a training program for the athlete
  - The coach can send videos, chat messages and audio messages to the student and vice-versa. In essence, we create an "internet relay private yoga lesson".
* This application is not meant as a free-for-all platform but rather as a follow-up tool for coaches to keep track of their athletes' progress.

### Technology

* Frontend: React + React Router + React MarkDown
* Backend: Express + sequelize as ORM on top of MySql

### Resources

* Info about yoga competition from IYSF: https://docs.google.com/presentation/u/0/d/1J4PiKBP9TaihO7UA_-Mpn92AVCyG55fOYBmKe4LFtuQ/mobilepresent
* Markdown: https://www.markdownguide.org/
* Youtube API: https://developers.google.com/youtube/v3/getting-started

## The database and its contents

Suggestion: use a separate database tech for the chat app

### Users and their roles

* Anybody can become a _user_. A _user_ does not have any specific roles, and therefore does not have access to anything. He just exists. This is made so that anybody can register, but only _coaches_ can decide to promote a _user_ to an _athlete_. You need to be at least an _athlete_ before you can use the application.
* The creation of a _user_ could trigger a message for all existing _coaches_ in the messagebox of the app (?)
* A _user_ can be promoted to an _athlete_ by a _coach_.
* A _user_ can be promoted to a _coach_ by an _admin_.
* A _user_ can be promoted to an _admin_ by the _superAdmin_.
* Only one person can be _SuperAdmin_ (that would be me, the programmer).
* Only one person _per organization_ can be _admin_. 
* A single person can be _SuperAdmin_, _admin_, _coach_, and _athlete_ at the same time
* The _user_ can:
  - create + edit a _user profile_. This profile should consist of:
    - first name (*)
    - last name (*)
    - date of birth (*)
    - biological sex at birth
    - phone
    - e-mail address (*)
    - password (*)
    - city
    - short bio text
    - profile pic (avatar url)
      (*) mandatory
    
      Notes & restrictions:
      - Only _coaches_ can promote a _user_ profile to an _athlete_ profile, this is to make sure not just everybody on the internet can create a profile of type _athlete_. Maybe add possibility for a coach to send a "create profile" invitation to a potential athlete?

  - access his library of _training programs_
  - ask for any coach or a specific coach by ways of messaging to a coach or coach group?

* The _coach_ can:
  - create a training _program_
  - edit a training _program_
  - duplicate a training _program_
  - delete training _programs_ he authored, if those are not assigned to any _athlete_
  - assign a training _program_ to an athlete
  - unassign a training _program_ from an athlete, if it has no contents (no chat, pics etc)
  - promote a _user_ to _athlete_ (including him/herself)

* The _admin_ can:
  - give a _user_ _coach_ privileges
  - give a _user_ _athlete_ privileges

* The _SuperAdmin_ can:
  - give a _user_ _admin_ privileges

### The training program

* A training _program_ is typically but not necessarily a set of 6 postures that, together, form an ideal set for a yoga competition. This means it should be a balanced set ideally consisting of an equal amount of strength, balancing and flexibility type poses. Alternatively, it can be any set of postures assembled by the coach for a specific therapeutic effect.
* A training program is assembled by a _coach_.
* A training program can be _public_ (every coach can use it) or _private_ (only the authoring coach can use it)

## Database table layout

### User table

  - primary key: number
  - first name: String (*)
  - last name: String (*)
  - date of birth: Date (*)
  - biological sex at birth: String ('Male' or 'Female') 
  - phone: String
  - e-mail address: String (*) --> for authentication
  - password: String (*)       --> for authentication, encrypted together as bcrypt hash?
  - city: String
  - short bio text: Text
  - profile pic (avatar) url: String
  - list with roles: String (*) The string contains zero or more "roles" separated by a space. Possible roles are 'superadmin', 'admin', 'coach', 'athlete'. The array can be empty, meaning the user has not been promoted to an athlete by a coach yet. 
    (*) mandatory

### Program Definition table

  - primary Key: number
  - title/ name: String
  - author: primary key of _user_ (a _coach_ obviously)
  - isPrivate: Boolean
  - program data: String (A program is a sequence of postures together with text and remarks... maybe write it as markdown? With "insert posture" feature)

### In-App Messages (athletes <-> coaches <-> admin): text only

Idea's: use the general chat system for these messages. It should be possible to send messages to groups of users, for example based on a class of athletes, or by role (all coaches, all athletes, etc). Coaches should be able to create groups, users should be able to block messages that are not specifically meant for them (or remove themselves from these groups, or hide group messages). Creating a coach based on a certain role could automatically subscribe the user to certain groups. 
Warning: don't confuse user roles with chat groups - a specific chatroom should be created for coaches for example.

These messages are generated by the app and send by athletes to coaches whenever they want to get coached, by admins to coaches whenever a user is upgraded to a coach, etc
  - primary key: number
  - timestamp: Date
  - archived: boolean (whether the message was dealt with)
  - main message: string (e.g. "John is looking for a coach", "Mareike got the additional role of _coach_")
  - additional remark: string (custom message from user)


### Assigned (active) Program table

  - primary key: number
  - primary key of a _program definition_: number
  - primary key of a coach: number
  - finished: Boolean
  - startedAt: Date
  - finishedAt: Date
  - TEXT with comma separated list of image and video filenames ?
  <!-- - "before" picture/vid filename: string
  - "after" picture/vid filename: string
  - camera roll: array of string (filenames) -->
  - chatlog between coach and athlete (with pictures & vids & audio logs etc whatsapp style) --> needs lazy loading

## API actions to implement

  (a _superAdmin_ always has full CRUD privileges on every asset, except on communication between coach and athlete)

  - CRUD on _user_
    Privileges:
      - _anyone_ can create a user. A user is NOT automatically an athlete.
      - a _user_ can update hiis own profile
      - a _coach_ can read and create a user.
      - a _coach_ can promote/ demote a user to/ from _athlete_
      - an _admin_ can read, create, promote/ demote and delete any user

  - CRUD on _program definition_
    Privileges:
      - a _coach_ can read his own programs as well as other coaches' public programs
      - a _coach_ can create, update and delete his own programs. Programs assigned to athletes can't be deleted
      - an _admin_ can only read public program definitions

  - CRUD on _assigned Programs_
    Privileges:
      - an _athlete_ can read assigned programs if assigned to himself
      - a _coach_ can create and update assigned programs and also delete them if empty (unassign a program)
      - an _admin_ can delete an _assigned program_ but not read it (!)

### Implemented so far

#### The api/users route

  - GET /api/users (*): returns the currently authenticated user. Returns the full user object except for the encrypted password and createdAt, updatedAt timestamps

  - POST /api/users: creates a user. POSTer need not be authenticated (anyone can create a user). _dateOfBirth_ should be in YYYY-MM-DD format and should be at least 8 years in the past. Example of a body of a POST request:
    ```JSON
    {
      "firstName": "steve",
      "lastName": "coogan",
      "emailAddress": "steve.coogan@gmail.com",
      "dateOfBirth": "1977-02-26",
      "password": "12345678"
    }
    ```

  - PUT /api/users/:id (*): update an existing user: 
    - a _user_ can update his own profile, change email address, password etc.
    - a _coach_ can promote a _user_ to _athlete_ or take the _athlete_ role away again. 
    - an _admin_ can do the above AND promote any _user_ to a _coach_ or take the _coach_ role away again. 
    - a _superadmin_ can do the above AND promote any _user_ to an _admin_
    Users can be _promoted_ or _demoted_ to a different set of roles by any given user with the _admin_ or _superadmin_ roles. 
    To **promote** a user (i.e. to add a role to an existing user) use the special key **promote** like so:
    ```JSON
    {
      "promote": "athlete coach"
    }
    ```
    This will add the roles of _athlete_ and _coach_ to the user with the **id** mentioned in the PUT request url. 

    To **demote** a user (i.e. to remove the _coach_ role) use the special key **demote** like so:
    ```JSON
    {
      "demote": "coach"
    }
    ```
    This will remove the role _coach_ from the user with the **id** mentioned in the PUT request url. 

#### The api/programs route

  - GET /api/programs (*): returns the programs the user should have access to.
  - GET /api/programs/:id (*): returns a single program with the specified id (if user has access)
  Note: both these routes need to be updated when the _assigned programs_ table is added to the database,
  so that _athletes_ can access programs that were assigned to them by a _coach_.

  - POST /api/programs (*): creates a program. User needs to have _coach_ privileges.
  - PUT  /api/programs (*): updates a program. Users can only update their own programs. 

  (*) requires auth header

### TO DO:


  (*) requires auth header

### Setup and usage

* backend (server): go to the /api folder, and run 'npm install' followed 'npm run seed'. To start the api server app, run 'npm start' to make the server listen for requests on port 5000. Surf to http://localhost:5000/ to check.
* frontend (client): go to the /client folder, and run 'npm install' followed by 'npm start' to start the React app, and surf to http://localhost:3000 to open the application.

If you want to reset the database to its initial state, go to the /api folder and run the command 'npm run seed'.