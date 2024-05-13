const express = require("express");
const userRoutes = require("./routes/userRoutes");

const app = express();

app.use("/api/v1/users", userRoutes);

app.all();
module.exports = app;
