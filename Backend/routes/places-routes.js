const express = require('express');
const {check} = require('express-validator');
const placeController = require('../controllers/places-controller');
const fileUpload = require('../middleware/file-upload');
const checkAuth = require('../middleware/check-auth');

const router = express.Router();  

router.get('/:pid',placeController.getPlacesById );

router.get('/user/:uid', placeController.getPlacesByUserId);

router.use(checkAuth);

router.post('/', 
    fileUpload.single('image'), 
    [check('title').notEmpty(), check('description').isLength({min: 5, max: 70}), check('address').notEmpty()], 
    placeController.createNewPlace);

router.patch('/:id',
    [check('title').notEmpty(), check('description').isLength({min: 5, max: 70})], 
    placeController.updatePlace); 

router.delete('/:id', placeController.deletePlace); 


module.exports = router;