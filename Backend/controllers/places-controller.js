const HttpError = require('../models/http-error');
const mongoose = require('mongoose');
const fs = require('fs');
const {validationResult} = require('express-validator');
const { v4: uuidv4 } = require('uuid');
const getCoordsForAddress = require('../utils/location');
const Place = require('../models/place');
const User = require('../models/user');

let DUMMY_PLACES = [
    {
        id: 'p1', 
        title: "Empire State Building",
        description: "One of the most famous Sky Scrappers in the world!",
        location: {
            lat: 40.7484474,
            lng: -73.9871516
        },
        creator: 'u1' 
    }
];

async function getPlacesById (req, res, next) { 
    console.log("GET REQUEST");
    const placesId = req.params.pid; 
    let place;
    try {
        place = await Place.findById(placesId);
    } catch (err) {
        const error = new HttpError("Something went Wrong, Could Not Find Place", 500);
        return next(error);
    }
    if(!place){
        const error = new HttpError("Could Not Find Place for the provided Id.", 404);
        return next(error);
    }
    res.json({place: place.toObject({getters: true})});  
}

const getPlacesByUserId = async (req, res, next) => {
    const userID = req.params.uid;
    let userWithPlaces;
    try {
        userWithPlaces = await User.findById(userID).populate('places'); 
    } catch (err) {
        console.log(err);
        return next(new HttpError("Something Went Wrong, Could not find Place for the User Id", 500));
    }
    
    if(!userWithPlaces || userWithPlaces.places.length == 0){ 
        return next(new HttpError("Could Not Find Places for the provided User Id.", 404)); 
    }
    res.json({places: userWithPlaces.places.map(place => place.toObject({getters: true}))});
}

const createNewPlace = async (req, res, next) =>{ 
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        console.log(errors);
        next(new HttpError("Invalid Inputs Passed, please check your data", 422));
    }
    const {title, description, address, creator} = req.body;
    let coordinates;

    try{
        coordinates = await getCoordsForAddress(address);
        lng = coordinates[0];
        lat = coordinates[1];
    }
    catch(error){
        return next(error);
    }
    const createdPlace = new Place({
        title,
        description,
        address,
        location: {lat, lng},
        image: req.file.path,
        creator
    });

    let user;  
    try {
        user = await User.findById(creator); 
    } catch (err) {
        return next(new HttpError("Creating Place Failed", 500));
    }
    if(!user){ 
        return next(new HttpError('Could Not Find User!', 500))
    }

    try {
        const sess = await mongoose.startSession();
        sess.startTransaction();
        await createdPlace.save({session: sess}); 
        user.places.push(createdPlace); 
        await user.save({session: sess}); 
        await sess.commitTransaction(); 
    } catch (err) {
        console.log(err);
        const error = new HttpError("Could Not Create Place in Database, Try Again!", 500);
        return next(error);
    }
    res.status(201).json({place: createdPlace}); 
}

async function updatePlace(req, res, next){
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        return next(new HttpError("Invalid Inputs Passed, please check your data. Cannot Update!", 422));
    }
    const {title, description} = req.body;
    const placeId = req.params.id;
    let updatedPlace;
    try {
        updatedPlace = await Place.findById(placeId);
    } catch (err) {
        return next(new HttpError("Could Not Find the Place, Try Again Later!", 500));
    }
    if(updatedPlace.creator.toString() !== req.userData.userId){
        return next(new HttpError("You are not allowed to edit this place!", 401));
    }
    updatedPlace.title = title;
    updatedPlace.description = description;
    try {
        await updatedPlace.save();
    } catch (err) {
        return next(new HttpError("Could Not Add Place, Try Again Later!", 500));
    }
    res.status(200).json({place: updatedPlace.toObject({getters: true})}); 
};

async function deletePlace(req, res, next){
    const placeId = req.params.id;
    let place;
    try {
        place = await Place.findById(placeId).populate('creator');
    } catch (err) {
        return next(new HttpError("Could Not Delete Place, Try Again!", 500));
    } 

    if(!place){
        return next(new HttpError("Could not find place for this Id", 500));
    }
    if(place.creator.id !== req.userData.userId){
        return next(new HttpError("You are not allowed to delete this place!", 401));
    }
    const imagePath = place.image;
    try {
        const sess = await mongoose.startSession(); 
        sess.startTransaction();
        place.deleteOne({session: sess});
        place.creator.places.pull(place);
        await place.creator.save({session: sess});
        await sess.commitTransaction();

    } catch (err) {
        return next(new HttpError("Could Not Delete place", 500));
    }
    fs.unlink(imagePath, err => {console.log(err)}); 
    res.status(200).json({message: "Deleted Place Successfully"});
};

exports.getPlacesById = getPlacesById; 
exports.getPlacesByUserId = getPlacesByUserId;
exports.createNewPlace = createNewPlace;
exports.updatePlace = updatePlace;
exports.deletePlace = deletePlace;