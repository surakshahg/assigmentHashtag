const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
var MongoClient = require('mongodb').MongoClient;

// create express app
const app = express();

// parse requests of content-type - application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: true }))

// parse requests of content-type - application/json
app.use(bodyParser.json())

// Configuring the database
const dbConfig = require('./config/database.config.js');


mongoose.Promise = global.Promise;

// Connecting to the database
mongoose.connect(dbConfig.url, {
    useNewUrlParser: true
}).then(() => {
    console.log("Successfully connected to the database");    
}).catch(err => {
    console.log('Could not connect to the database. Exiting now...', err);
    process.exit();
});



// mongodb querry

// define a simple route
app.get('/SearchState', (req, res) => {
	var details_statecode = req.body.StateCode;
	var details_stateName = req.body.StateName;
    //res.json({"message": "Welcome to EasyNotes application. Take notes quickly. Organize and keep track of all your notes."});
    MongoClient.connect(dbConfig.url, function (err, db) {
	    db.collection('city_list', function (err, collection) {
	       //collection.find({StateCode:details_statecode}).toArray(function(err, items) {
	         collection.find({StateUnionterritory:{$regex:details_stateName}}, { District: 1}).toArray(function(err, items) {
	            if(err) throw err; 
	           res.json(items);            
	        });
	        
	    });            
	});
});

app.get('/SearchTown', (req, res) => {
	var details_citytown = req.body.CityTown;
    MongoClient.connect(dbConfig.url, function (err, db) {
	    db.collection('city_list', function (err, collection) {
	         collection.find({CityTown:{$regex:details_citytown}}, { District: 1, StateUnionterritory: 1 }).toArray(function(err, items) {
	            if(err) throw err; 
	           res.json(items);            
	        });
	        
	    });            
	});
});

app.get('/SearchDistrict', (req, res) => {
	var details_district = req.body.District;
	console.log(details_district);
    MongoClient.connect(dbConfig.url, function (err, db) {
	    db.collection('city_list', function (err, collection) {
	         collection.find({District:{$regex:details_district}},{CityTown:1, District: 1}).toArray(function(err, items) {
	            if(err) throw err; 
	           res.json(items);            
	        });
	        
	    });            
	});
});
// listen for requests
app.listen(3000, () => {
    console.log("Server is listening on port 3000");
});