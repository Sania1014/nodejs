const express = require("express");
const fs = require("fs");
const path = require("path");
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");
const jsonwebtoken = require("jsonwebtoken");
const bcrypt=require('bcrypt');

const app = express();
const users = [];
//use of middlewares
app.use(express.static(path.join(__dirname, "public"))); //to use static files
app.use(express.urlencoded({ extended: true })); //to access form data
app.use(cookieParser()); //to get cookies details

app.set("view engine", "ejs");

const isAuthenticated = async (req, res, next) => {
  const { token } = req.cookies;
  if (token) {
    const decoded = jsonwebtoken.verify(token, "abcdefghijk");
    req.user = await User.findById(decoded._id);
    next();
  } else {
    res.redirect("/login");
  }
};

//json is basically object of objects

mongoose
  .connect("mongodb://127.0.0.1:27017", {
    dbName: "backend",
  })
  .then(() => console.log("db connected"));

const userSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: String,
});

//making collection

const User = mongoose.model("User", userSchema);

app.get("/", isAuthenticated, (req, res) => {
  res.render("logout", { name: req.user.name });
});

app.get("/register", (req, res) => {
  res.render("register");
});

app.get("/login", (req, res) => {
  res.render("login");
});

app.post("/login", async (req, res) => {
  const { email, password } = req.body;
  let user = await User.findOne({ email });
  if (!user) {
    return res.redirect("/register");
  }
 
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    return res.render("login", { message: "Incorrect password", email: email });
  }
  const token = jsonwebtoken.sign({ _id: user._id }, "abcdefghijk");
  res.cookie("token", token, {
    httpOnly: true,
    maxAge: 60000,
  });
  res.redirect("/");
});

app.post("/register", async (req, res) => {
  const { name, email, password } = req.body;

  let user = await User.findOne({ email });
  if (user) {
    return res.redirect("/login");
  }
const hashed_password=await bcrypt.hash(password, 10);

  user = await User.create({ name, email, password: hashed_password });
  const token = jsonwebtoken.sign({ _id: user._id }, "abcdefghijk");
  res.cookie("token", token, {
    httpOnly: true,
    maxAge: 60000,
  });
  res.redirect("/");
});

app.get("/logout", (req, res) => {
  res.cookie("token", null, {
    expires: new Date(Date.now()),
  });
  res.redirect("/");
});

app.listen(5000);
