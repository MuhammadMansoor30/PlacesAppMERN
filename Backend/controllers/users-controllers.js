const HttpError = require('../models/http-error');
const bcrypt = require('bcryptjs'); 
const jwt = require('jsonwebtoken'); 
const { v4: uuidv4 } = require('uuid');
const {validationResult} = require('express-validator');
const User = require('../models/user');
const user = require('../models/user');

let DUMMY_USERS = [
    {
        id: "u1",
        name: "Basit Charsi",
        email: "test@test.com",
        password: "tester"
    }
]
async function getUsers(req, res, next){
    let users;
    try {
        users = await User.find({}, '-password'); 
    } catch (err) {
        return next(new HttpError("Could Not Find Users!", 500));
    }

    res.json({users: users.map(user => user.toObject({getters:true}))});  
};

const signUp = async (req, res, next) =>{
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        return next(new HttpError("Invalid Credentials Added, Cannot Sign Up", 422));
    }
    const {name, email, password} = req.body;
    let existingUser;

    try {
        existingUser = await User.findOne({email: email}); 
    } catch (err) {
        return next(new HttpError("Signing In Failed. Try Again!", 500));
    }

    let hashedPassword;
    try {
        hashedPassword = await bcrypt.hash(password, 12);
    } catch (err) {
        return next(new HttpError("Could Not create a user. Try Again!", 500));
    }
    const createdUser = new User({
        name,
        email,
        image: req.file.path,  
        password: hashedPassword,
        places: [], 
    });
    try {
        await createdUser.save();
    } catch (err) {
        return next(new HttpError("User Already exists! Please Login instead", 500));
    }
    let token;
    try {
        token = jwt.sign({userId: createdUser.id, email: createdUser.email},
            'supersecret_dont_share',  
            {expiresIn: '1hr'}); 
    } catch (err) {
        return next(new HttpError("Signing In Failed. Try Again!", 500));
    }
    res.status(201).json({userId: createdUser.id, email: createdUser.email, token: token});
};

async function login(req, res, next){
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        return next(new HttpError("Invalid Credentials, Cannot Login!", 422));
    }
    const {email, password} = req.body;
    let existingUser;

    try {
        existingUser = await User.findOne({email: email});
    } catch (err) {
        return next(new HttpError("Logging In Failed!", 500));
    }
    if(!existingUser){
        return next(new HttpError("Invalid Credentials! Could Not Log You In!", 401));
    }
    let isValidPassword = false;
    try {
        isValidPassword = await bcrypt.compare(password, existingUser.password);
    } catch (err) {
        return next(new HttpError("Could Not Log You in! Invalid Credentials", 500));
    }

    if(!isValidPassword){
        return next(new HttpError("Invalid Credentials! Could Not Log You In!", 401));
    }

    let token;
    try {
        token = jwt.sign({userId: existingUser.id, email: existingUser.email}, 
            'supersecret_dont_share',  
            {expiresIn: '1hr'});
    } catch (err) {
        return next(new HttpError("Logging In Failed. Try Again!", 500));
    }
    res.json({userId: existingUser.id, email: existingUser.email, token: token}); 

};

exports.getUsers = getUsers;
exports.login = login;
exports.signUp = signUp;
