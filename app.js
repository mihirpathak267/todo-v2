// require all the packages and the date module
require('dotenv').config()
const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");
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
mongoose.connect(process.env.MONGODB_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverSelectionTimeoutMS: 5000, // wait up to 5 seconds for server selection
    socketTimeoutMS: 45000,
  })
  .then(() => console.log('MongoDB connected'))
  .catch((err) => console.log('MongoDB connection error:', err));
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

// creating a new Schema for custom lists, name will have the name of the list.
const listSchema = new mongoose.Schema({
    name: String,
    items: [itemsSchema]
});
// creating a model for the above Schema
const List = new mongoose.model("List", listSchema);


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
// Using express routing params to get custom list names and see if they exist then create it
app.get("/:customListName", function(req, res){
    const customListName = _.capitalize(req.params.customListName);
    
    List.findOne({name: customListName}, function(err, foundList){
        if(!err){
            if (!foundList){
                const list = List({
                    name: customListName,
                    items: defaultArray
                });
                list.save();
                res.redirect("/"+ customListName);
            
            } else {

                res.render("list", {listTitle: foundList.name, newListItems: foundList.items});
            }
            
            
        } else{
            res.render("list", {listTitle: customListName, newListItems: foundList})
        }
    })
})


app.post("/", function(req, res){
    const itemName = req.body.newItem;
    const listName = req.body.list;

    const item = new Item({
        name: itemName
    });

    if (listName == "Today"){
        // Use using mongoose shortcut save instead of insertOne
        item.save();
        // Render the home route which now renders the new item
        res.redirect("/")        
    } else{
        List.findOne({name: listName}, function(err, foundList){
            if (!err){
                foundList.items.push(item);
                foundList.save();
                res.redirect("/" + listName);
            } else {
                console.log(err);
            };
        });
    };
    
});

app.post("/delete", function(req, res){
    const checkedItemId = req.body.checkbox;
    const listName = req.body.listName
if (listName === "Today"){
    Item.findByIdAndRemove(checkedItemId, function(err, docs){
        if (!err){
            console.log("Removed item: " ,docs);
            res.redirect("/");
        }
    });
}else{
    List.findOneAndUpdate({name: listName}, {$pull: {items: {_id: checkedItemId}}}, function(err, foundList){
        if (!err){
            res.redirect("/"+listName);
        };

    });
};
});

app.listen(process.env.PORT, function() {
  console.log("Server started on port 3000");
});
