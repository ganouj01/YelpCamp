if(process.env.NODE_ENV !== 'production'){
    require('dotenv').config()
}

// require('dotenv').config()

const express = require('express');
const path = require('path');
const methodOverride = require('method-override');
const mongoose = require('mongoose');
const campgrounds = require('./routes/campgrounds');
const reviews = require('./routes/reviews');
const users = require('./routes/users');
const ejsMate = require('ejs-mate');
const ExpressError = require('./utils/ExpressError');
const session = require('express-session');
const flash = require('connect-flash');
const passport = require('passport');
const localStrategy = require('passport-local');
const User = require('./models/user')
const mongoSanitize = require('express-mongo-sanitize');
const helmet = require('helmet')
const MongoStore = require('connect-mongo');


// Moved routes:
// const Campground = require('./models/campground')
// const Joi = require('joi')
// const {campgroundSchema, reviewSchema} = require('./schemas')
// const Review = require('./models/review')
// const catchAsync = require('./utils/catchAsync')
// process.env.DB_URL

const dbUrl = process.env.DB_URL || 'mongodb://localhost:27017/yelp-camp';

mongoose.connect(dbUrl, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'Connection Error:'))
db.once('open', ()=>{
    console.log('Database Connected')
});

const app = express();

const secret = process.env.SECRET ||  'thisshouldbeabettersecret'

const store = MongoStore.create({
    mongoUrl: dbUrl,
    touchAfter: 24 * 60 * 60,
    crypto: {
        secret
    }
});

const sessionConfig = {
    store: store,
    name: 'session',
    secret,
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        // secure: true,
        expires: Date.now() + 1000*60*60*24*7,
        maxAge: 1000*60*60*24*7
    }
}

app.use(flash())
app.use(session(sessionConfig))
app.use(helmet())

const scriptSrcUrls = [
    "https://stackpath.bootstrapcdn.com/",
    "https://api.tiles.mapbox.com/",
    "https://api.mapbox.com/",
    "https://kit.fontawesome.com/",
    "https://cdnjs.cloudflare.com/",
    "https://cdn.jsdelivr.net",
];
const styleSrcUrls = [
    "https://kit-free.fontawesome.com/",
    "https://stackpath.bootstrapcdn.com/",
    "https://api.mapbox.com/",
    "https://api.tiles.mapbox.com/",
    "https://fonts.googleapis.com/",
    "https://use.fontawesome.com/",
    "https://cdn.jsdelivr.net"
];
const connectSrcUrls = [
    "https://api.mapbox.com/",
    "https://a.tiles.mapbox.com/",
    "https://b.tiles.mapbox.com/",
    "https://events.mapbox.com/",
];
const fontSrcUrls = [];
app.use(
    helmet.contentSecurityPolicy({
        directives: {
            defaultSrc: [],
            connectSrc: ["'self'", ...connectSrcUrls],
            scriptSrc: ["'unsafe-inline'", "'self'", ...scriptSrcUrls],
            styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
            workerSrc: ["'self'", "blob:"],
            objectSrc: [],
            imgSrc: [
                "'self'",
                "blob:",
                "data:",
                "https://res.cloudinary.com/anuj999/", //SHOULD MATCH YOUR CLOUDINARY ACCOUNT! 
                "https://images.unsplash.com/",
            ],
            fontSrc: ["'self'", ...fontSrcUrls],
        },
    })
);



app.use(passport.initialize());
app.use(passport.session())
passport.use(new localStrategy(User.authenticate()))

passport.serializeUser(User.serializeUser())
passport.deserializeUser(User.deserializeUser())

app.engine('ejs', ejsMate)
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));
app.use(express.static(path.join(__dirname, 'public')))
app.use(mongoSanitize())

// app.use((req,res,next)=>{
//     console.log(req.session)
//     res.locals.currentUser = req.user;
//     res.locals.success = req.flash('success');
//     res.locals.error = req.flash('error');
//     next()
// })
app.use((req, res, next) => {
    // console.log(req.session)
    res.locals.currentUser = req.user;
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    next();
})

// app.use((req, res, next) => {
//     if(!['/login', '/'].includes(req.originalUrl)) {
//         req.session.returnTo = req.originalUrl;
//         console.log(req.ses)
//     }
//     res.locals.currentUser = req.user;
//     res.locals.success = req.flash('success');
//     res.locals.error = req.flash('error');
//     next();
// });

app.get('/fakeUser', async(req,res)=>{
    const user = new User({email: 'sharkandy@ytf.com', username: 'sharkandy'});
    const newUser = await User.register(user, 'chimken');
    res.send(newUser)
})

app.get('/', (req,res)=>{
    res.render('campgrounds/home')
})

app.get('/home', (req,res)=>{
    res.render('home')
})

app.use('/', users)
app.use('/campgrounds', campgrounds)
app.use('/campgrounds/:id/reviews', reviews)

// app.get('/makeCampground', async(req,res)=>{
//     const camp = new Campground({title: 'Hill-Spring', description: 'Cheap camp'});
//     await camp.save();
//     res.send(camp);
// })

app.all('*',(req,res,next)=>{
    next(new ExpressError('Page not found', 404))
})

app.use((err,req,res,next)=>{
    const {statusCode=500} = err;
    if(!err.message) err.message = 'Oh No! Theres an error'
    res.status(statusCode).render('error', {err})
})

const port = process.env.PORT || 3000

app.listen(port, ()=>{
    console.log(`Serving on port ${port}`)
})