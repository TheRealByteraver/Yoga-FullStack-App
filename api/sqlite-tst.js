const sqlite3 = require('sqlite3').verbose();
const { User, Course, Program } = require('./models');

// open the database
let db = new sqlite3.Database('fsjstd-restapi.db');

// db.all(SELECT * FROM Users, [], (err, rows) => {



  db.all(`SELECT 'Program'.'id', 'Program'.'title', 'Program'.'isPrivate', 'Program'.'description', 'Program'.'createdAt', 'Program'.'updatedAt', 'Program'.'userId', 'programAuthor'.'id' AS 'programAuthor.id', 'programAuthor'.'roles' AS 'programAuthor.roles', 'programAuthor'.'firstName' AS 'programAuthor.firstName', 'programAuthor'.'lastName' AS 'programAuthor.lastName', 'programAuthor'.'emailAddress' AS 'programAuthor.emailAddress', 'programAuthor'.'password' AS 'programAuthor.password', 'programAuthor'.'dateOfBirth' AS 'programAuthor.dateOfBirth', 'programAuthor'.'biologicalSex' AS 'programAuthor.biologicalSex', 'programAuthor'.'phone' AS 'programAuthor.phone', 'programAuthor'.'city' AS 'programAuthor.city', 'programAuthor'.'biography' AS 'programAuthor.biography', 'programAuthor'.'avatarUrl' AS 'programAuthor.avatarUrl', 'programAuthor'.'createdAt' AS 'programAuthor.createdAt', 'programAuthor'.'updatedAt' AS 'programAuthor.updatedAt' FROM 'Programs' AS 'Program' LEFT OUTER JOIN 'Users' AS 'programAuthor' ON 'Program'.'userId' = 'programAuthor'.'id' WHERE ('Program'.'id' = '1' AND ('Program'.'isPrivate' = 0 OR 'Program'.'userId' = 4)) LIMIT 1;`, [], (err, rows) => {


  if (err) {
    throw err;
  }
  rows.forEach((row) => {
    console.log(row);
  });
});

// close the database connection
db.close();