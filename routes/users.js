const express = require('express');
const passport = require('passport');
const router = express.Router({mergeParams:true});
const User = require('../models/user');
const catchAsync = require('../utils/catchAsync');
const users = require('../controllers/users')

router.route('/register')
    //registering user - get req
    .get(users.renderRegister)
    //registering - post req
    .post(catchAsync(users.register));

router.route('/login')
    //login - get req
    .get(users.renderLogin)
    //login - post req
    // with local, we can also specify other platforms like google, twitter
    .post(passport.authenticate('local', {failureFlash : true, failureRedirect:'/login'}), users.login);

//logout
router.get('/logout',users.logout)

module.exports=router;