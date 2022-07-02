const express = require('express')
const router = express.Router({mergeParams:true});
const catchAsync = require('../utils/catchAsync')
const {isLoggedIn, validateReview, isReviewAuthor} = require('../middleware')
const reviews = require('../controllers/reviews');

//for submitting a review
router.post('/', isLoggedIn, validateReview, catchAsync(reviews.createReview))

//deleting a review
router.delete('/:reviewId', isLoggedIn, isReviewAuthor, catchAsync(reviews.deleteReview))

module.exports=router;