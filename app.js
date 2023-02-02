

const express = require("express");
const bodyParser = require("body-parser");
// const date = require(__dirname+"\\date.js");
const mongoose = require('mongoose');
const _ = require('lodash');


const app = express();



app.set('view engine','ejs');

app.use(bodyParser.urlencoded({extended:true}));

app.use(express.static("public"));

mongoose.connect('mongodb://127.0.0.1:27017/todolistDB');

const itemsSchema = {
    name: String
};

const Item = mongoose.model('Item',itemsSchema);

const item1 = new Item({
    name : 'Welcome to your todolist!'
});

const item2 = new Item({
    name: 'Hit the + button to aff a new item.'
});

const item3 = new Item({
    name: "<-- Hit this to delete an item."
});

const defaultItems = [item1,item2,item3];

const listSchema = {
    name : String,
    items : [itemsSchema]
};

const List = mongoose.model("List",listSchema);

app.get("/",function(req,res){

//    let day = date.getDate();

    

    Item.find({}, function(err,foundItems){
        // console.log(foundItems);
        if(foundItems.length === 0){
            Item.insertMany(defaultItems,function(err){
                    if(err){
                        console.log(err);
                    }else{
                        console.log('succeessfully saved default items to database');
                    }
                });
                res.redirect("/");
        } else{
            res.render("list",{listTitle: 'Today',newListItems:foundItems});
        }

        
    });

    
});



app.post("/",function(req,res){

    const itemName=req.body.newItem;
    const listName=req.body.list;

    const item = new Item({
        name : itemName
    });

    if (listName === "Today"){
        item.save();
        res.redirect("/");
    } else {
        List.findOne({name: listName},function(err,foundList){
            foundList.items.push(item);
            foundList.save();
            res.redirect("/"+listName);
        });
    }

    // if(req.body.list === "Work"){
    //     workItems.push(item);
    //     res.redirect("/work");
    // }else{
    //     items.push(item); 
    //     res.redirect("/");
    // }


});

app.post("/delete",function(req,res){
    // console.log(req.body);
    const checkedItemId = req.body.checkbox;
    const listName = req.body.listName;

    if (listName === 'Today'){
        Item.findByIdAndRemove(checkedItemId,function(err){
            if(!err){
                console.log('Successfully deleted checked item');
                res.redirect('/');
            }
        });
    } else {
        List.findOneAndUpdate({name:listName},{$pull : {items:{_id:checkedItemId}}},function(err,foundList){
            if(!err){
                res.redirect("/"+listName);
            }
        });
    }
});

app.get("/work",function(req,res){
    res.render("list",{listTitle:"Work List",newListItems:workItems});
});

// app.post("/work",function(req,res){
//     // let item = req.body.newItem;
//     // workItems.push(item);
//     // res.redirect("/work");
// });

app.get("/:customListName",function(req,res){
    const customListName = _.capitalize(req.params.customListName);

    List.findOne({name:customListName},function(err,foundList){
        if (!err){
            if(!foundList){
                // console.log("Doesn't exists");
                const list = new List({
                    name : customListName,
                    items : defaultItems,
                });
            
                list.save();
                res.redirect("/"+customListName);


            }else{
                // console.log("Exists!!");
                res.render("list",{listTitle: foundList.name,newListItems:foundList.items})
            }
        }
    });

    

});

app.get("/about",function(req,res){
    res.render("about");
});


app.listen(3000,function(){
    console.log("Server started on port 3000");
})