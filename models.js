"use strict";

// On Windows we needa DBPASSWORD
// if (/^win/.test(process.platform) && ! process.env.DATABASE_URL) {
//   console.log('You need to set DBURL in your env.sh file');
//   process.exit(1);
// }
//
//connecting to Heroku database
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

//connecting to local database
// var Sequelize = require('sequelize');
// var sequelize = new Sequelize(process.env.DATABASE_NAME, 'postgres', process.env.DATABASE_PASSWORD, {
//     dialect: 'postgres',
//     logging: false
// });

sequelize
  .authenticate()
  .then(() => {
    console.log('Connection has been established successfully.');
  })
  .catch(err => {
    console.error('Unable to connect to the database:', err);
  });

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
    type: Sequelize.DATEONLY,
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
  },
  groupId: {
    type: Sequelize.INTEGER,
    allowNull: true
  }
});

const Apartment = sequelize.define('apartment', {
    id: {
      type: Sequelize.BIGINT,
      primaryKey: true
    },
    address: {
      type: Sequelize.STRING
    },
    area: {
      type: Sequelize.INTEGER,
      allowNull: true
    },
    baths: {
      type: Sequelize.FLOAT,
      allowNull: true
    },
    beds: {
      type: Sequelize.INTEGER,
      allowNull: true
    },
    dateAvailable: {
      type: Sequelize.DATE
    },
    lat: {
      type: Sequelize.FLOAT
    },
    lng: {
      type: Sequelize.FLOAT
    },
    postBody: {
      type: Sequelize.TEXT
    },
    price: {
      type: Sequelize.FLOAT
    },
    timePosted: {
      type: Sequelize.STRING
    },
    title: {
      type: Sequelize.STRING
    }
  }
);

const AptPicture = sequelize.define('aptpicture', {
  url: {
    type: Sequelize.STRING,
    allowNull: false
  }
});

Apartment.belongsTo(User, {foreignKey: 'poster_id'});
AptPicture.belongsTo(Apartment, {foreignKey: 'apartment_id'});

const Messages = sequelize.define('messages', {
  roomId: {
    type: Sequelize.STRING,
    allowNull: true
  },
  timeStamp: {
    type: Sequelize.STRING,
    allowNull: true
  },
  content: {
    type: Sequelize.TEXT,
    allowNull: true
  }
});

Messages.belongsTo(User, {foreignKey: 'user_id'});

const Questionnaire = sequelize.define('questionnaire', {
    '1_personal': Sequelize.INTEGER,
    '1_others': Sequelize.INTEGER,
    '2_personal': Sequelize.INTEGER,
    '2_others': Sequelize.INTEGER,
    '3_personal': Sequelize.INTEGER,
    '3_others': Sequelize.INTEGER,
    '4_personal': Sequelize.INTEGER,
    '4_others': Sequelize.INTEGER,
    '5_personal': Sequelize.INTEGER,
    '5_others': Sequelize.INTEGER,
    '6_personal': Sequelize.INTEGER,
    '6_others': Sequelize.INTEGER,
    '7_personal': Sequelize.INTEGER,
    '7_others': Sequelize.INTEGER,
    '8_personal': Sequelize.INTEGER,
    '8_others': Sequelize.INTEGER,
    '9_personal': Sequelize.INTEGER,
    '9_others': Sequelize.INTEGER,
    '10_personal': Sequelize.INTEGER,
    '10_others': Sequelize.INTEGER,
    '11_personal': Sequelize.INTEGER,
    '11_others': Sequelize.INTEGER,
    '12_personal': Sequelize.INTEGER,
    '12_others': Sequelize.INTEGER,
    '13_personal': Sequelize.INTEGER,
    '13_others': Sequelize.INTEGER,
    '14_personal': Sequelize.INTEGER,
    '14_others': Sequelize.INTEGER,
    '15_personal': Sequelize.INTEGER,
    '15_others': Sequelize.INTEGER,
    '16_personal': Sequelize.INTEGER,
    '16_others': Sequelize.INTEGER,
    '17_personal': Sequelize.INTEGER,
    '17_others': Sequelize.INTEGER,
    '18_personal': Sequelize.INTEGER,
    '18_others': Sequelize.INTEGER,
    '19_personal': Sequelize.INTEGER,
    '19_others': Sequelize.INTEGER,
    '20_personal': Sequelize.INTEGER,
    '20_others': Sequelize.INTEGER
});

const Region = sequelize.define('regions', {
    north: Sequelize.FLOAT,
    south: Sequelize.FLOAT,
    east: Sequelize.FLOAT,
    west: Sequelize.FLOAT,
    time: Sequelize.BIGINT
});

const AptFilter = sequelize.define('aptfilter', {
    maxBed: Sequelize.INTEGER,
    minBed: Sequelize.INTEGER,
    maxBath: Sequelize.INTEGER,
    minBath: Sequelize.INTEGER,
    maxDate: Sequelize.DATE,
    minDate: Sequelize.DATE,
    minPrice: Sequelize.INTEGER,
    maxPrice: Sequelize.INTEGER,
})

Questionnaire.belongsTo(User, {foreignKey: 'user_id'});
Region.belongsTo(User, {foreignKey: 'user_id'});
AptFilter.belongsTo(User, {foreignKey: 'user_id'});

module.exports = {
  User,
  Apartment,
  Messages,
  AptPicture,
  Questionnaire,
  Region,
  AptFilter,
  sequelize,
  Sequelize
};
