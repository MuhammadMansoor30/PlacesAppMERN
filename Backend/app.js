const express = require('express');
const bodyParser = require('body-parser');
const placesRoutes = require("./routes/places-routes");
const userRoutes = require("./routes/users-routes");
const HttpError = require('./models/http-error');
const mongoose = require('mongoose');
const fs = require('fs'); 
const path = require('path');

// Replace with your own Mongo DB URL
const urlDB = 'mongodb+srv://username:password@cluster0.mongodb.net/mydatabase?retryWrites=true&w=majority'; 

const app = express();

app.use(bodyParser.json());

app.use('/uploads/images', express.static(path.join('uploads', 'images')));

app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*')  
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization')
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE');
    next();
});

app.use("/api/places", placesRoutes);  

app.use("/api/users", userRoutes); 

app.use((req, res, next) =>{
    const error = new HttpError("Could not find this Message", 404);
    throw error;
});

// Error handling middleware executed automatically if and error has occured.
app.use((error, req, res, next) =>{
    if(req.file){ 
        fs.unlink(req.file.path, err => {console.log(err)}); 
    }
    if(res.headerSent){
        return next(error); 
    }
    res.status(error.code || 500); 
    res.json({message: error.message || "An unknown Error Occured"}); 

});
mongoose.connect(urlDB).then(() => app.listen(5000)).catch(err => console.log(err));
