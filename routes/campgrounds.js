const express = require('express');
const router = express.Router()
const catchAsync = require('../utils/catchAsync')
const passport = require('passport-local-mongoose')
const {isLoggedIn, validateCampground, isAuthor} = require('../middleware')
const campgrounds = require('../controller/campgrounds')
const multer = require('multer')
const {storage} = require('../cloudinary')
const upload = multer({storage})

const Campground = require('../models/campground')
const ExpressError = require('../utils/ExpressError')

router.route('/')
.get(catchAsync(campgrounds.index))
.post(isLoggedIn, upload.array('image') ,validateCampground, catchAsync(campgrounds.createNew))

router.get('/new', isLoggedIn, (campgrounds.newForm))

router.route('/:id')
.get(catchAsync(campgrounds.show))
.put( isLoggedIn, isAuthor, upload.array('image') ,validateCampground, catchAsync(campgrounds.edit))
.delete( isLoggedIn, isAuthor, catchAsync(campgrounds.delete))

router.get('/:id/edit', isLoggedIn, isAuthor, catchAsync(campgrounds.editForm))

module.exports = router;