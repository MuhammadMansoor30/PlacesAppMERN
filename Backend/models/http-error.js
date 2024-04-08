// Creating the Error Model for our app.

class HttpError extends Error {
    constructor(message, errorCode){
        super(message); // Adds "message property"
        this.errorCode = errorCode; // Adds "ErrorCode" property
    }
}

module.exports = HttpError;