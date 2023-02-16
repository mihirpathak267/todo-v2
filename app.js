// require all the packages and the date module
const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const date = require(__dirname + "/date.js");
mongoose.set('strictQuery', false);
// set the express() app
const app = express();
// set the view engine as ejs
app.set('view engine', 'ejs');
// tell app to use bodyParser and the static folder public
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

// connect to the database
main().catch(err => console.log(err));
 
async function main() {
  await mongoose.connect('mongodb://localhost:27017/FruitsDB');
  }
async function main(){
    await mongoose.connect("mongodb://localhost:27017/todolistDB");
}

app.listen(3000, function() {
  console.log("Server started on port 3000");
});
