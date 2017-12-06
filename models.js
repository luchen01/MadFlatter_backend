"use strict";

// On Windows we needa DBPASSWORD
// if (/^win/.test(process.platform) && ! process.env.DATABASE_URL) {
//   console.log('You need to set DBURL in your env.sh file');
//   process.exit(1);
// }

if (!global.hasOwnProperty('db')) {
  var Sequelize = require('sequelize')
    , sequelize = null }

  if (process.env.DATABASE_URL) {
    // the application is executed on Heroku ... use the postgres database
    sequelize = new Sequelize(process.env.DATABASE_URL, {
      dialect:  'postgres',
      protocol: 'postgres',
      port:     5432,
      host:     process.env.HOST,
      logging:  true, //false
      dialectOptions: {
        ssl: true
      }
    })
  } else {
    // the application is executed on the local machine ... use mysql
    sequelize = new Sequelize('example-app-db', 'root', null)
  }


// sequelize
//   .authenticate()
//   .then(() => {
//     console.log('Connection has been established successfully.');
//   })
//   .catch(err => {
//     console.error('Unable to connect to the database:', err);
//   });

// Define models here
// YOUR CODE HERE

const User = sequelize.define('user', {
  firstname: {
    type: Sequelize.STRING,
    allowNull: false
    // unique: true
  },
  lastname: {
    type: Sequelize.STRING,
    allowNull: false
  },
  username: {
    type: Sequelize.STRING,
    allowNull: true,
    unique: true
  },
  password: {
    type: Sequelize.STRING,
    allowNull: true
  },
  email: {
    type: Sequelize.STRING,
    allowNull: true,
    unique: true
  },
  birthday: {
    type: Sequelize.DATE,
    allowNull: true
  },
  gender: {
    type: Sequelize.STRING,
    allowNull: true
  },
  profileUrl:{
    type: Sequelize.STRING,
    allowNull: true
  },
  facebookId: {
    type: Sequelize.STRING,
    allowNull: true
  },
  googleId: {
    type: Sequelize.STRING,
    allowNull: true
  },
  facebookToken: {
    type: Sequelize.STRING,
    allowNull: true
  },
  googleToken: {
    type: Sequelize.STRING,
    allowNull: true
  }
});

const Apartment = sequelize.define('apartment', {
  roomtype: {
    type: Sequelize.STRING,
    allowNull: false
  }
});

Apartment.belongsTo(User);


module.exports = {
  // Export models here
  // YOUR CODE HERE
  User,
  Apartment,
  sequelize,
  Sequelize
};
