// IMPORTS

const app = require("./app");
const dotenv = require("dotenv");
const mongoose = require("mongoose");

//config for .env

dotenv.config({ path: "./config.env" });

// CONNECTING MONGODB

mongoose
  .connect(process.env.DATABASE, {
    useNewUrlParser: true,
  })
  .then((con) => {
    // console.log(con.connections);
    console.log("DB connection successful!");
  })
  .catch((error) => {
    console.error("Error connecting to MongoDB:", error.message);
    process.exit(1); // Exit with an error code
  });

const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log(`Your server is running on port ${port}`);
});