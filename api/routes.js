'use strict';

const express = require('express');
const { asyncHandler } = require('./middleware/async-handler');
const { User, Course, Program } = require('./models');
const { authenticateUser } = require('./middleware/auth-user');
const { Op } = require('sequelize');
const { roleValues, roleStrings, getCleanRolesArr, getHighestRoleValue} = require('./helpers/userRoles');

const YOGA_COMPETITION_MINIMUM_AGE = 8;

// Construct a router instance.
const router = express.Router();

// ****************************************************************************
// ****************************************************************************
// Helper function to make error handling cleaner:
function handleSQLErrorOrRethrow(error, response) {
  if (error.name === 'SequelizeValidationError' || 
      error.name === 'SequelizeUniqueConstraintError') {
    const errors = error.errors.map(err => err.message);
    response.status(error.status || 400).json({ errors });   
  } else {
    console.log('Rethrowing the error ', error);
    throw error;
  }
}

// Helper function that adds http status to error object for later error handling 
function throwError(statusCode, message) {
  const error = new Error(message);  
  error.status = statusCode; // http status code
  throw error;               // let the error handler below handle it further 
}

// Helper function to get rid of createdAt, updatedAt & password fields from Courses
function filterCourseData(courseData) {
  const course = {...courseData}; // don't modify original object
  delete course["createdAt"];
  delete course["updatedAt"];
  delete course.courseUser["createdAt"];
  delete course.courseUser["updatedAt"];
  delete course.courseUser["password"];
  return course;
}

// Helper function that returns current age (in years) based on birthday
function howOld(dateOfBirth) {
  if (typeof dateOfBirth !== 'object') {
    throw new Error('parameter "dateOfBirth" of function "howOld()" should be of type "object ("Date")"');
  }
  const today = new Date();
  let yearsOld = today.getFullYear() - dateOfBirth.getFullYear();
  if ((today.getMonth() < dateOfBirth.getMonth()) ||
    (today.getMonth() === dateOfBirth.getMonth() && today.getDate() < dateOfBirth.getDate())) {
    yearsOld--;
  }
  return yearsOld;
}

// Convert Linux epoch time to string in "YYYY-MM-DD" format
function getDateStrFromEpoch(epoch) {
  const date = new Date(epoch * 1000);
  const day = date.getDate();
  const dayStr = `${day > 9 ? '' : '0'}${day}`;
  const month = date.getMonth() + 1;
  const monthStr = `${month > 9 ? '' : '0'}${month}`;
  return `${date.getFullYear()}-${monthStr}-${dayStr}`;
}

// helper function that removes some unnecessary keys from a program before
// we give it back to the api consumer
function filterProgramData(program) {
  const programAuthor = {
    ...program.programAuthor.dataValues,
    dateOfBirth: getDateStrFromEpoch(program.programAuthor.dataValues.dateOfBirth)
  };

  delete programAuthor.password;
  delete programAuthor.roles;

  return {
    id: program.id,
    title: program.title,
    isPrivate: program.isPrivate,
    description: program.description,
    createdAt: program.createdAt,
    updatedAt: program.updatedAt,
    // userId: program.userId, // unnecessary, already mentioned in programAuthor
    programAuthor
  };
}

// ****************************************************************************
// ****************************************************************************
// Route that returns the currently authenticated user
router.get('/users', authenticateUser, asyncHandler(async (req, res) => {

  // We already got the user from the _authenticateUser_ middleware. So we 
  // only need to clean it up a bit and convert the _dateOfBirth_ key
  const user = req.currentUser.dataValues;
  delete user["password"];
  delete user["createdAt"];
  delete user["updatedAt"];

  // convert dateOfBirth from epoch to YYYY-MM-DD string
  if (user.dateOfBirth) {    
    user.dateOfBirth = getDateStrFromEpoch(epoch);    
  }

  res.status(200).json({ ...user });
}));

// Route that creates a new user.
router.post('/users', asyncHandler(async (req, res) => {

  // check if dateOfBirth is in the correct format
  let dateOfBirth = req.body.dateOfBirth;
  if (dateOfBirth) {
    const isCorrectFormat = /^\d{4}-\d{2}-\d{2}$/.test(dateOfBirth);
    if (!isCorrectFormat) {
      throwError(404, `'dateOfBirth' key should be in YYYY-MM-DD format, e. g. '1989-05-26'`);
    }

    // check if the dateOfBirth is valid
    const month = parseInt(dateOfBirth.substring(5, 7));
    const day = parseInt(dateOfBirth.substring(8, 10));

    if (month > 12 || day > 31) {
      throwError(404, `Invalid Birth date. Date should be in YYYY-MM-DD format, e. g. '2001-05-26'`);
    }

    // convert to epoch for saving in database
    dateOfBirth = new Date(dateOfBirth).getTime() / 1000;

    // check if user is old enough to participate in the competition:
    const yearsOld = howOld(dateOfBirth);
    if (yearsOld < YOGA_COMPETITION_MINIMUM_AGE) {
      throwError(404, `User is too young to participate in the yoga competition`);
    }
  }

  try {
    await User.create({
      ...req.body,
      dateOfBirth,
      roles: ''      // new users have no roles by default
    });
    res.location('/').status(201).end();
  } catch (error) {
    handleSQLErrorOrRethrow(error, res);
  }
}));

// Route that updates an existing user. Unallowed actions will not create errors (!)
router.put('/users/:id', authenticateUser, asyncHandler(async (req, res) => {
  // first find the user that needs to be updated
  const userToUpdate = await User.findByPk(req.params.id);
  if (!userToUpdate) {
    throwError(404, 'The user you are trying to update does not exist (anymore).🤷‍♂️');
  }

  const authenticatedUser = req.currentUser;
  const newUserData = req.body;

  // if isSameUser is true, then user profile updates are allowed
  const isSameUser = (authenticatedUser.id === userToUpdate.id);

  // start with current user roles
  let newRolesArr = getCleanRolesArr(userToUpdate.roles);

  // get privilege level of currently authenticated user
  const authenticatedUserLevel = getHighestRoleValue(authenticatedUser.roles);

  // Only coaches & (super)admins can promote/ demote users
  if (authenticatedUserLevel > roleValues['athlete']) {
    // check if we need to promote user
    const promoteRoles = getCleanRolesArr(newUserData.promote);
    promoteRoles.forEach(roleStr => {
      // if authenticated user has higher role than this role, add the role,
      // but only if user did not already have this role
      if (authenticatedUserLevel > roleValues[roleStr] && !newRolesArr.includes(roleStr)) {
        newRolesArr.push(roleStr);
      }
    });
    // check if we need to demote user
    const demoteRoles = getCleanRolesArr(newUserData.demote);
    demoteRoles.forEach(roleStr => {
      // if authenticated user has higher role than this role, remove the role. 
      if ((authenticatedUserLevel > roleValues[roleStr]) 
        // || (authenticatedUserLevel === roleValues[roleStr] && isSameUser)
        ) {
          newRolesArr = newRolesArr.filter(str => str !== roleStr);
      }
    });
  }

  // Any given user is only allowed to update other users' user rights, nothing else
  const userUpdateObject = isSameUser ? { ...newUserData } : {};
  userUpdateObject.roles = getCleanRolesArr(newRolesArr.join(' ')).join(' ');
  // console.log('userUpdateObject.roles', userUpdateObject.roles);

  // update the user
  try {
    await userToUpdate.update(userUpdateObject);
    console.log('updating user', req.params.id, 'with data: ', userUpdateObject); // DEBUG
    res.location('/').status(201).end();
  } catch (error) {
    handleSQLErrorOrRethrow(error, res);
  }
}));

// ****************************************************************************
// TODO: athletes should have access to private training programs if the program
// was assigned to them at one point => check assigned_programs table
// Route that returns the programs the authenticated user has access to
router.get('/programs', authenticateUser, asyncHandler(async (req, res) => {
  const user = req.currentUser.dataValues;
  // const userRoles = getRoles(user.roles);
  // if (userRoles.hasNoRights) {
  //   throwError(401, 'You need to have at least "athlete" privileges to view training programs');
  // }

  if (getHighestRoleValue(user.roles) < roleValues['athlete']) {
    throwError(401, 'You need to have at least "athlete" privileges to view training programs');
  }

  try {
    // find all programs:
    //     - that are public
    //     - that are made by the currently authenticated user (if that user is a coach)
    const programsData = await Program.findAll({
      include: [
        { model: User, as: 'programAuthor' }
      ],
      where: {
        [Op.or]: [
            { isPrivate: false }, // 0 in the database
            { userId: req.currentUser.id }
        ]
      }
    });

    // clean up data we got from the database query (remove passwords etc):
    const apiResponseObject = programsData.map(program => filterProgramData(program));

    res.status(200).json(apiResponseObject);
  } catch(error) {
    handleSQLErrorOrRethrow(error, res);
  }
}));

// TODO: athletes should have access to private training programs if the program
// was assigned to them at one point => check assigned_programs table
// Route that returns the program specified by 'id' (authentication is required)
router.get('/programs/:id', authenticateUser, asyncHandler(async (req, res) => {
  const user = req.currentUser.dataValues;
  // const userRoles = getRoles(user.roles);
  // if (userRoles.hasNoRights) { 
  //   throwError(401, 'You need to have at least "athlete" privileges to view training programs');
  // }

  if (getHighestRoleValue(user.roles) < roleValues['athlete']) {
    throwError(401, 'You need to have at least "athlete" privileges to view training programs');
  }

  try {
    // find the program with the specified id and make sure that it is either:
    //     - public
    //     - made by the currently authenticated user (if that user is a coach)
    const program = await Program.findOne({
      where: {
        [Op.and]: [
          { id: req.params.id },
          {
            [Op.or]: [
              { isPrivate: false }, // 0 in the database
              { userId: req.currentUser.id }
            ]
          }
        ]
      },
      include: [
        { model: User, as: 'programAuthor' }
      ]
    });

    if (!program) {
      throwError(401, `The training program with id ${req.params.id} is private and you are not the author`);
    }    

    // clean up data we got from the database query (remove passwords etc):
    const apiResponseObject = filterProgramData(program);

    res.status(200).json(apiResponseObject);
  } catch(error) {
    handleSQLErrorOrRethrow(error, res);
  }
}));

// Route that creates a program (authentication is required)
router.post('/programs', authenticateUser, asyncHandler(async (req, res) => {
  const user = req.currentUser.dataValues;
  // const userRoles = getRoles(user.roles);
  // if (!userRoles.isCoach) {
  //   throwError(401, 'You need to have at least "coach" privileges to create training programs');
  // }

  if (getHighestRoleValue(user.roles) < roleValues['coach']) {
    throwError(401, 'You need to have at least "coach" privileges to create training programs');
  }  

  try {
    const program = await Program.create({
      userId: user.id,
      title: req.body.title,
      isPrivate: req.body.isPrivate,
      description: req.body.description
    });

    res.location(`/programs/${program.id}`).status(201).end(); 
    } catch(error) {
      handleSQLErrorOrRethrow(error, res);
    }  
}));

// update the corresponding program and 
// return a 204 HTTP status code and no content.  
router.put('/programs/:id', authenticateUser, asyncHandler(async (req, res) => {
  const user = req.currentUser.dataValues;
  // const userRoles = getRoles(user.roles);
  // if (!userRoles.isCoach) {
  //   throwError(401, 'You need to have at least "coach" privileges to edit training programs');
  // }
  if (getHighestRoleValue(user.roles) < roleValues['coach']) {
    throwError(401, 'You need to have at least "coach" privileges to edit training programs');
  }  

  const program = await Program.findByPk(req.params.id);
  if (program) {
    if (program.userId === user.id) {
      req.body.userId = user.id;
      await program.update(req.body);
      res.status(204).end();  
    } else {
      throwError(403, 'The program you are trying to update does not belong to you.🤷‍♂️');
    }
  } else {
    throwError(404, 'The program you are trying to update does not exist (anymore).🤷‍♂️');
  }  
}));










// END OF YOGA API








// ****************************************************************************
// return all courses including the User associated with each course 
// and a 200 HTTP status code.
router.get('/courses', asyncHandler(async (req, res) => {
  try {
    const coursesData = await Course.findAll({
      include: [
        {
          model: User,
          as: 'courseUser'
        }
      ]
    });  
    const courses = coursesData.map(courseData => 
      filterCourseData(courseData.get({ plain: true }))
    );
    res.status(200).json(courses);
  } catch(error) {
    handleSQLErrorOrRethrow(error, res);
  }
}));

// return the corresponding course including the User associated with 
// that course and a 200 HTTP status code.
router.get('/courses/:id', asyncHandler(async (req, res) => {
  try {
    const course = await Course.findAll({
      where: {
        id: req.params.id
      },
      include: [
        {
          model: User,
          as: 'courseUser'
        }
      ]
    });  
    if (course[0]) { // doesn't work, because findAll() throws error if it can't find anything :(
      res.status(200).json(filterCourseData(course[0].get({ plain: true })));
    } else {
      throwError(404, 'The course you are trying to see does not exist (anymore).🤷‍♂️');
    }
  } catch(error) {
    //console.log(`GET /courses/${req.params.id} "crashed" the api!`);
    handleSQLErrorOrRethrow(error, res);
  }
}));

// create a new course, set the Location header to the URI for the 
// newly created course, and return a 201 HTTP status code and no content.
router.post('/courses', authenticateUser, asyncHandler(async (req, res) => {
  try {
    const user = await User.findByPk(req.currentUser.id);
    if (user) {
      req.body.userId = user.id;
      const course = await Course.create(req.body);
      res.location(`/courses/${course.id}`).status(201).end(); 
    } else {
      throwError(401, 'Authentication error creating course');
    }
  } catch(error) {
    handleSQLErrorOrRethrow(error, res);
  }  
}));

// update the corresponding course and 
// return a 204 HTTP status code and no content.  
router.put('/courses/:id', authenticateUser, asyncHandler(async (req, res) => {
  try {
    const user = await User.findByPk(req.currentUser.id);
    if (user) {
      const course = await Course.findByPk(req.params.id);
      if (course) {
        // console.log('Found the course ', req.params.id, '!');
        if (course.userId === user.id) {
          req.body.userId = user.id;
          await course.update(req.body);    
          res.status(204).end();  
        } else { // this authorized user is not authorized to update this course (it's not his course)
          throwError(403, 'The course you are trying to update does not belong to you.🤷‍♂️');
        }
      } else {
        throwError(404, 'The course you are trying to update does not exist (anymore).🤷‍♂️');
      }  
    } else { // user specified in auth header was not found
      throwError(401, 'Authorization failed');
    }
  } catch(error) {
    handleSQLErrorOrRethrow(error, res);
  }
}));

// A /api/courses/:id DELETE route that will delete the corresponding 
// course and return a 204 HTTP status code and no content.
router.delete('/courses/:id', authenticateUser, asyncHandler(async (req, res) => {
  try {
    const user = await User.findByPk(req.currentUser.id);
    if (user) {
      const course = await Course.findByPk(req.params.id);
      if (course) {
        if (course.userId === user.id) {
          await course.destroy();
          res.status(204).end();
        } else { // this authorized user is not authorized to delete this course (it's not his course)
          throwError(403, 'The course you are trying to delete does not belong to you.🤷‍♂️');
        }
      } else {
        throwError(404, 'The course you are trying to delete does not exist (anymore).🤷‍♂️');
      }  
    } else { // user specified in auth header was not found
      throwError(401, 'Authorization failed');
    }
  } catch(error) {
    handleSQLErrorOrRethrow(error, res);
  }
}));
  
module.exports = router;