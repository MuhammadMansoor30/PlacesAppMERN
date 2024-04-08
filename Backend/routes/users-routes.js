const express = require('express');
const userController = require('../controllers/users-controllers');
const {check} = require('express-validator');
const fileUpload = require('../middleware/file-upload');

const router = express.Router(); 

router.get('/', userController.getUsers);

router.post('/signUp', 
    fileUpload.single('image'), 
    [check('name').notEmpty(), check('email').normalizeEmail().isEmail(), check('password').isLength({min: 6})],
    userController.signUp);

router.post('/login',
    [check('email').normalizeEmail().isEmail(), check('password').isLength({min: 6})],
    userController.login);

module.exports = router;