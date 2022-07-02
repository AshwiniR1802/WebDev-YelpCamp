const express = require('express')
const router = express.Router();
const catchAsync = require('../utils/catchAsync')
const Campground = require('../models/campground')
const {isLoggedIn, isAuthor, validateCampground} = require('../middleware')
const campgrounds = require('../controllers/campgrounds')
const multer = require('multer');
const {storage} = require('../cloudinary');
const upload = multer({storage});

router.route('/')
    //show all campgrounds
    .get(catchAsync(campgrounds.index))
    //use joi for server side validations
    .post(isLoggedIn, upload.array('image'), validateCampground, catchAsync(campgrounds.createCampground)); //image - name given in show page while accepting file
    
//adding a new campground
router.get('/new', isLoggedIn,campgrounds.renderNewForm);

router.route('/:id')
    //get details of campgrounds
    .get(catchAsync(campgrounds.showCampgrounds))
    //for editing a campground
    .put(isLoggedIn, isAuthor, upload.array('image'), validateCampground, catchAsync(campgrounds.updateCampground))
    //deleting campground
    .delete(isLoggedIn, isAuthor, catchAsync(campgrounds.deleteCampground));


//for editing a campground
router.get('/:id/edit', isLoggedIn, isAuthor, catchAsync(campgrounds.renderEditForm));

module.exports=router;