const express = require("express");
const app = express();
const path = require("path");
const dotenv = require("dotenv").config({
  path: path.resolve(__dirname, "../.env"),
});
const mongoose = require("mongoose");
const initialposts = require("../Assets/blog_posts");
// const { title } = require("process");
// const exp = require("constants");
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

mongoose
  .connect(process.env.MONGO_URL)
  .then(() => {
    console.log("DB connected");
  })
  .catch((err) => {
    console.log("Error in connecting to DB", err);
  });
//Creating schema
const blogSchema = new mongoose.Schema({
  author: String,
  password: String,
  image: String,
  title: String,
  content: { para1: String, para2: String, para3: String },
});

const Blog = mongoose.model("Blog", blogSchema);

//setting views
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "../Frontend/views"));
app.use(express.static(path.join(__dirname, "../Frontend/public")));

app.get("/", async (req, res) => {
  //added the initial posts basically with this
  // await Blog.insertMany(initialposts);
  const blogs = await Blog.find({});
  res.render("frontpage", { blogs });
});

//listening at port 3000
app.listen(3000);
