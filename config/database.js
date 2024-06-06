const mongoose = require("mongoose");
mongoose.set("strictQuery", true);
var mysql = require("mysql");

const mongodbConnect = mongoose
  .connect(process.env.MONGODB_DATABASE_URL, {})
  .then(() => {
    console.log("Successfully connected to database...");
  });

mongoose.connection.on("error", (err) => {
  console.log(err);
  console.error("Error connecting to the mongoDB :", err);
});

const pool = mysql.createPool({
  host: process.env.SQL_HOST,
  user: process.env.SQL_USER_NAME,
  password: process.env.SQL_PASSWORD,
  database: process.env.SQL_DATABASE,
  // port: process.env.SQL_PORT
});

pool.getConnection((err, connection) => {
  if (err) {
    console.error("Error connecting to the MySQL database:", err);
  } else {
    console.log("MySQL Connected successfully!");
    connection.release(); // Release the connection back to the pool
  }
});

// const  database_connection= mysql.createConnection({
//   host: 'localhost',
//   // port: 3306, // Default MySQL port
//   user: 'root',
//   password: '',
//   database: 'purpus_user'
// });

// database_connection.connect((err) => {
//   if (err) {
//     console.error('Error connecting to the database:', err);
//     return;
//   }
//   console.log('Connected to the MYSQL DATABASE!');
// });

module.exports = { mongodbConnect, pool };
// module.exports = { mongodbConnect };
