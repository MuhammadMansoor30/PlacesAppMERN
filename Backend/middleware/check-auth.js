const HttpError = require("../models/http-error");
const jwt = require('jsonwebtoken');

module.exports = (req, res, next) =>{
    if(req.method === "OPTIONS"){
        return next(); 
    }
    try {
        const token = req.headers.authorization.split(' ')[1];
        if(!token){
            throw new Error("Authorization Failed!");
        }
        const decodedToken = jwt.verify(token, 'supersecret_dont_share'); // Verifying the token and then decoding it.
        req.userData = {userId: decodedToken.userId}; 
        next();
    } catch (err) {
        return next(new HttpError("Authorization Failed!", 401));
    }
}