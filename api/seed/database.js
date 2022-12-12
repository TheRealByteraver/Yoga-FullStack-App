'use strict';

const bcryptjs = require('bcryptjs');
const Context = require('./context');

class Database {
  constructor(seedData, enableLogging) {
    this.programs = seedData.programs;
    this.courses = seedData.courses;
    this.users = seedData.users;
    this.enableLogging = enableLogging;
    this.context = new Context('fsjstd-restapi.db', enableLogging);
  }

  log(message) {
    if (this.enableLogging) {
      console.info(message);
    }
  }

  tableExists(tableName) {
    this.log(`Checking if the ${tableName} table exists...`);

    return this.context
      .retrieveValue(`
        SELECT EXISTS (
          SELECT 1 
          FROM sqlite_master 
          WHERE type = 'table' AND name = ?
        );
      `, tableName);
  }

  createUser(user) {
    let dateOfBirth = null;
    if (user.dateOfBirth) {
      dateOfBirth = Math.trunc(new Date(user.dateOfBirth).getTime() / 1000);
    }

    return this.context
      .execute(`
        INSERT INTO Users
          (roles, firstName, lastName, emailAddress, password, 
           dateOfBirth, biologicalSex, phone, city, biography, avatarUrl, createdAt, updatedAt)
        VALUES
          (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'));
      `,
      user.roles,
      user.firstName,
      user.lastName,
      user.emailAddress,
      user.password,
      dateOfBirth,
      user.biologicalSex,
      user.phone,
      user.city,
      user.biography,
      user.avatarUrl
    );
  }

  createProgram(program) {
    return this.context
      .execute(`
        INSERT INTO Programs
          (userId, title, isPrivate, description, createdAt, updatedAt)
        VALUES
          (?, ?, ?, ?, datetime('now'), datetime('now'));
      `,
      program.userId,
      program.title,
      program.isPrivate,
      program.description);
  }

  createCourse(course) {
    return this.context
      .execute(`
        INSERT INTO Courses
          (userId, title, description, estimatedTime, materialsNeeded, createdAt, updatedAt)
        VALUES
          (?, ?, ?, ?, ?, datetime('now'), datetime('now'));
      `,
      course.userId,
      course.title,
      course.description,
      course.estimatedTime,
      course.materialsNeeded);
  }

  async hashUserPasswords(users) {
    const usersWithHashedPasswords = [];

    for (const user of users) {
      const hashedPassword = await bcryptjs.hash(user.password, 10);
      usersWithHashedPasswords.push({ ...user, password: hashedPassword });
    }

    return usersWithHashedPasswords;
  }

  async createUsers(users) {
    for (const user of users) {
      await this.createUser(user);
    }
  }

  async createCourses(courses) {
    for (const course of courses) {
      await this.createCourse(course);
    }
  }

  async createPrograms(programs) {
    for (const program of programs) {
      await this.createProgram(program);
    }
  }  

  async init() {
    // Initialize User table
    const userTableExists = await this.tableExists('Users');

    if (userTableExists) {
      this.log('Dropping the Users table...');

      await this.context.execute(`
        DROP TABLE IF EXISTS Users;
      `);
    }

    this.log('Creating the Users table...');

    await this.context.execute(`
      CREATE TABLE Users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        roles VARCHAR(255) NOT NULL DEFAULT '',
        firstName VARCHAR(255) NOT NULL DEFAULT '', 
        lastName VARCHAR(255) NOT NULL DEFAULT '', 
        emailAddress VARCHAR(255) NOT NULL DEFAULT '' UNIQUE, 
        password VARCHAR(255) NOT NULL DEFAULT '',
        dateOfBirth INTEGER NOT NULL,
        biologicalSex VARCHAR(255),
        phone VARCHAR(255),
        city VARCHAR(255),
        biography VARCHAR(1024),
        avatarUrl VARCHAR(255),
        createdAt DATETIME NOT NULL, 
        updatedAt DATETIME NOT NULL
      );
    `);

    this.log('Hashing the user passwords...');

    const users = await this.hashUserPasswords(this.users);

    this.log('Creating the user records...');

    await this.createUsers(users);

    // Initialize Course table
    const courseTableExists = await this.tableExists('Courses');

    if (courseTableExists) {
      this.log('Dropping the Courses table...');

      await this.context.execute(`
        DROP TABLE IF EXISTS Courses;
      `);
    }

    this.log('Creating the Courses table...');

    await this.context.execute(`
      CREATE TABLE Courses (
        id INTEGER PRIMARY KEY AUTOINCREMENT, 
        title VARCHAR(255) NOT NULL DEFAULT '', 
        description TEXT NOT NULL DEFAULT '', 
        estimatedTime VARCHAR(255), 
        materialsNeeded VARCHAR(255), 
        createdAt DATETIME NOT NULL, 
        updatedAt DATETIME NOT NULL, 
        userId INTEGER NOT NULL DEFAULT -1 
          REFERENCES Users (id) ON DELETE CASCADE ON UPDATE CASCADE
      );
    `);

    this.log('Creating the course records...');

    await this.createCourses(this.courses);

    // Initialize Program table
    const programTableExists = await this.tableExists('Programs');

    if (programTableExists) {
      this.log('Dropping the Programs table...');

      await this.context.execute(`
        DROP TABLE IF EXISTS Programs;
      `);
    }

    this.log('Creating the Programs table...');

    await this.context.execute(`
      CREATE TABLE Programs (
        id INTEGER PRIMARY KEY AUTOINCREMENT, 
        title VARCHAR(255) NOT NULL DEFAULT '', 
        isPrivate BOOLEAN NOT NULL,
        description TEXT NOT NULL DEFAULT '', 
        createdAt DATETIME NOT NULL, 
        updatedAt DATETIME NOT NULL, 
        userId INTEGER NOT NULL DEFAULT -1 
          REFERENCES Users (id) ON DELETE CASCADE ON UPDATE CASCADE
      );
    `);

    this.log('Creating the program records...');

    await this.createPrograms(this.programs);

    this.log('Database successfully initialized!');
  }
}

module.exports = Database;
