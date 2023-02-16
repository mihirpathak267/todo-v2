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
  await mongoose.connect('mongodb://localhost:27017/todolistDB');
};
// creating a new schema for todo items
const itemsSchema = new mongoose.Schema({
    name: String
});
// creating a new model to use the above schema
const Item  = new mongoose.model("Item", itemsSchema);
// creating default items to show when the page loads up
const item1 = new Item({
    name: "Welcome to the Todo app."
});
const item2 = new Item({
    name: "Hit the '+' button to add new items to the list."
});
const item3 = new Item({
    name:"<---- Click on the checkbox once you're done with the task."
});
// store the default items into an array to push them all at once
const defaultArray = [item1, item2, item3];


// using find method to read from database and render items on the home page
app.get("/", function(req, res){

    Item.find({}, function(err, foundItems){
        if (foundItems.length == 0){
            // insert default items into the database
            Item.insertMany(defaultArray, function(err){
                if (err){
                    console.log(err);
                } else {
                    console.log("Successfully added default items to DB");
                }   
            });
            res.redirect("/");
        }else{
            res.render("list",{listTitle: "Today", newListItems: foundItems});
        }
    })
        
    
});

app.post("/", function(req, res){
    const itemName = req.body.newItem;
    const item = new Item({
        name: itemName
    });
    // Use using mongoose shortcut save instead of insertOne
    item.save();
    // Render the home route which now renders the new item
    res.redirect("/")
})

app.listen(3000, function() {
  console.log("Server started on port 3000");
});
