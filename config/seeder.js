const fs = require('fs');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const chalk = require('chalk');

// Load env vars
dotenv.config({ path: './config.env' });

// Load models
const Bootcamp = require('../models/bootcampModel');
const Course = require('../models/courseModel');
const User = require('../models/userModel');
const Review = require('../models/reviewModel');

const DB =
  'mongodb+srv://Armar:01004468937@apis.uj4am.mongodb.net/devcampers?retryWrites=true&w=majority';

mongoose.set('autoIndex', true);

const connectDB = async () => {
  const con = await mongoose.connect(DB, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true,
    autoIndex: true
  });

  console.log(
    chalk.bgGreen.black(`MongoDB Connected: ${con.connection.host}.`)
  );
};

connectDB();

// Read JSON files
const bootcamps = JSON.parse(
  fs.readFileSync(`${__dirname}/../_data/bootcamps.json`, 'utf-8')
);

const courses = JSON.parse(
  fs.readFileSync(`${__dirname}/../_data/courses.json`, 'utf-8')
);

const users = JSON.parse(
  fs.readFileSync(`${__dirname}/../_data/users.json`, 'utf-8')
);

const reviews = JSON.parse(
  fs.readFileSync(`${__dirname}/../_data/reviews.json`, 'utf-8')
);

// Import into DB
const importData = async () => {
  try {
    await Bootcamp.create(bootcamps);
    await Course.create(courses);
    await User.create(users);
    await Review.create(reviews);
    console.log(chalk.green('Data Imported...'));
    process.exit();
  } catch (err) {
    console.error(err);
  }
};

// Delete data
const deleteData = async () => {
  try {
    await Bootcamp.deleteMany();
    await Course.deleteMany();
    await User.deleteMany();
    await Review.deleteMany();
    console.log(chalk.red('Data Destroyed...'));
    process.exit();
  } catch (err) {
    console.error(err);
  }
};

if (process.argv[2] === '-i') {
  importData();
} else if (process.argv[2] === '-d') {
  deleteData();
}
