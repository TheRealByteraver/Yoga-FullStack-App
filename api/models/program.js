/*
* A training _program_ is typically but not necessarily a set of 6 postures
* that, together, form an ideal set for a yoga competition. This means it 
* should be a balanced set ideally consisting of an equal amount of strength, 
* balancing and flexibility type poses. Alternatively, it can be any set of 
* postures assembled by the coach for a specific therapeutic effect.
* A training program is assembled by a _coach_.
* A training program can be _public_ (every coach can use it) or _private_ 
* (only the authoring coach can use it)
*/

'use strict';
const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  class Program extends Model {}
  Program.init({
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notNull: {
          msg: 'A title is required'
        },
        notEmpty: {
          msg: 'Please provide a title'
        }
      }
    },
    isPrivate: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      validate: {
        notNull: {
          msg: 'It must be stated whether the training program is private or not'
        }
      }
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false,
      validate: {
        notNull: {
          msg: 'A description is required'
        },
        notEmpty: {
          msg: 'Please provide a description'
        }
      }
    }
  }, { sequelize });

  Program.associate = (models) => {
    // one-to-one from User to Program: 
    // This tells Sequelize that a Program can be associated 
    // with only one user (the author of the program)
    Program.belongsTo(models.User, { 
      as: 'programAuthor', // alias
      foreignKey: {
        fieldName: 'userId',
        allowNull: false
      }
    });
  };

  return Program;
};