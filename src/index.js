const express = require("express");

const app = express();

// to store and use env variables in .env file
const dotenv = require("dotenv");
dotenv.config();

const mongoose = require("mongoose");
const cors = require("cors");

const router = require("./routes");
const { globalErrorHandler } = require("./utils");

//Connecting to db
mongoose.set("strictQuery", false);
const mongoURL = process.env.MONGO_URL;
mongoose.connect(mongoURL);

const database = mongoose.connection;

database.on("error", (error) => {
  console.log(error);
});

database.once("connected", () => {
  console.log("Database Connected");
});

// global middlewares
app.use(cors());
app.use(express.json()); // to parse the req.body as json object

app.use("/public", express.static("public")); // for rendering the public folder statically

//routes
app.get("/", (req, res) => {
  // res.send('Hello World');
  res.send({ message: "Welcome" });
  console.log("ok");
});
app.use("/api", router);

app.use(globalErrorHandler);

app.listen(8000, () => {
  console.log("Server started at port 8000");
});
