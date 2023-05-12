const express = require('express');
const { Passport } = require('passport');
const router = express.Router()
const User = require('../models/user');
const flash = require('connect-flash');
const passport = require('passport');
const catchAsync = require('../utils/catchAsync')
const users = require('../controller/users')

router.route('/register')
.get(users.registerForm)
.post(catchAsync(users.register))

router.route('/login')
.get(users.loginForm)
.post(passport.authenticate('local', {failureFlash: true, failureRedirect: '/login'}), users.login)

router.get('/logout', users.logout)

module.exports = router;