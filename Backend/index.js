require("dotenv").config();
const express = require("express");
const app = express();
const path = require("path");
const mongoose = require("mongoose");

//using cloudinary to handle image uploads
const cloudinary = require("cloudinary").v2;
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET,
});
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const multer = require("multer");
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "Blog-posts",
    allowedFormats: ["png", "jpg", "jpeg"],
  },
});
const upload = multer({ storage: storage });

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

mongoose
  .connect(process.env.MONGO_URL)
  .then(() => {
    console.log("Database connected successfully");
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

app.set("view engine", "ejs"); //setting views
app.set("views", path.join(__dirname, "../Frontend/views"));
app.use(express.static(path.join(__dirname, "../Frontend/public")));

// Home Route
app.get("/", async (req, res) => {
  //added the initial posts with await Blog.insertMany(initialposts);
  const blogs = await Blog.find({});
  res.render("frontPage", { blogs });
});

// Write Route
app.get("/posts", async (req, res) => {
  res.render("newPost");
});

// Write Form Route
app.post("/posts", upload.single("listingImage"), async (req, res) => {
  console.log(req.file.path);
  const blog = new Blog({
    author: req.body.author,
    password: req.body.password,
    image: req.file.path,
    title: req.body.title,
    content: {
      para1: req.body.para1,
      para2: req.body.para2,
      para3: req.body.para3,
    },
  });
  try {
    await blog.save();
  } catch (err) {
    console.log(err);
    res.status(500).send("Error saving the blog post");
  }
});

// Read Route
app.get("/:id", async (req, res) => {
  try {
    const id = req.params.id;
    // Validate MongoDB ObjectID format
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).render("404");
    }
    const post = await Blog.findById(id);
    if (!post) {
      return res.status(404).render("404");
    }
    res.render("blogPosts", { post });
  } catch (error) {
    console.error(error); // Log the actual error for debugging
    res.status(500).send("Server Error");
  }
});

//Error 404 page
app.use((req, res) => {
  res.status(404).render("404");
});
//listening at port 3000
// app.listen(3000);
