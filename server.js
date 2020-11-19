const chalk = require('chalk');
const mongoose = require('mongoose');
const dotenv = require('dotenv');

// Handle uncaught exceptions
// process.on('uncaughtException', (err) => {
//   console.log(chalk.bgRed('UNCAUGHT EXCEPTION! 💥 Shutting down...'));
//   console.log(err.name, err.message);
//   process.exit(1);
// });

dotenv.config({ path: './config/config.env' });
const app = require('./app');

const DB = process.env.DATABASE_CONNECTION.replace(
  '<PASSWORD>',
  process.env.DATABASE_PASSWORD
);

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

const port = process.env.PORT || 5000;

const server = app.listen(port, () => {
  console.log(`App running on port ${chalk.greenBright(port)}...`);
});

// Handle unhandled promise rejections
// process.on('unhandledRejection', (err) => {
//   console.log(chalk.bgRed('UNHANDLED REJECTION! 💥 Shutting down...'));
//   console.log(err.name, err.message);
//   // Close server & exit process
//   server.close(() => {
//     process.exit(1);
//   });
// });

// process.on('SIGTERM', () => {
//   console.log('👋 SIGTERM RECEIVED. Shutting down gracefully');
//   server.close(() => {
//     console.log('💥 Process terminated!');
//   });
// });
