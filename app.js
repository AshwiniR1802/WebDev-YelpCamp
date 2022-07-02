//if we are not working in production mode. for image upload
if(process.env.NODE_ENV !== 'production'){
    require('dotenv').config();
}
// console.log(process.env.CLOUDINARY_KEY)

const express = require('express');
const app = express();
const path = require('path');
const ejsMate = require('ejs-mate');  //ejs-mate for styling
const ExpressError=require('./utils/ExpressError')

//connect cloud database
// const dbUrl=process.env.DB_URL;
const dbUrl = process.env.DB_URL || 'mongodb://localhost:27017/yelp-camp';

//connect mongoose
const mongoose = require('mongoose');
const campground = require('./models/campground');
// 'mongodb://localhost:27017/yelp-camp'
mongoose.connect(dbUrl,
{useNewUrlParser : true, useUnifiedTopology : true}, {useCreateIndex:true}) 

const db = mongoose.connection;
db.on('error', console.error.bind(console, "connection error: "));
db.once('open', ()=>{
    console.log("Database connected");
});

//for storing session info
//making sessions and flash
const session = require('express-session');
const flash = require('connect-flash'); //flash
const MongoDBStore=require('connect-mongo')(session)

//for routes - campgrounds
const campgroundRoutes = require('./routes/campgrounds')
const reviewRoutes = require('./routes/reviews')
const userRoutes = require('./routes/users')

//for sanitizing user req queries - if they enter $ or . or any character
const mongoSanitize = require('express-mongo-sanitize')
app.use(mongoSanitize({
    replaceWith : '_'
}))

//for headers - helmet
const helmet = require('helmet');
//content sec policy disables every functionality from bootstarp, js, maps, etc
app.use(helmet());

const scriptSrcUrls = [
    "https://stackpath.bootstrapcdn.com/",
    "https://api.tiles.mapbox.com/",
    "https://api.mapbox.com/",
    "https://kit.fontawesome.com/",
    "https://cdnjs.cloudflare.com/",
    "https://cdn.jsdelivr.net/",
    "https://res.cloudinary.com/dtdoiorcy/"
];
const styleSrcUrls = [
    "https://kit-free.fontawesome.com/",
    "https://stackpath.bootstrapcdn.com/",
    "https://api.mapbox.com/",
    "https://api.tiles.mapbox.com/",
    "https://fonts.googleapis.com/",
    "https://use.fontawesome.com/",
    "https://cdn.jsdelivr.net/",
    "https://res.cloudinary.com/dtdoiorcy/"
];
const connectSrcUrls = [
    "https://api.mapbox.com/",
    "https://a.tiles.mapbox.com",
    "https://b.tiles.mapbox.com",
    "https://api.mapbox.com",
    "https://events.mapbox.com",
    "https://res.cloudinary.com/dtdoiorcy/"
];
const fontSrcUrls = [ "https://res.cloudinary.com/dtdoiorcy/" ];
 
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
                "https://res.cloudinary.com/dtdoiorcy/", //SHOULD MATCH YOUR CLOUDINARY ACCOUNT! 
                "https://images.unsplash.com/",
            ],
            fontSrc    : [ "'self'", ...fontSrcUrls ],
        },
    })
);

//for post, patch requests
const methodOverride = require('method-override');
app.use(methodOverride('_method'))
app.use(express.static(path.join(__dirname, 'public')))

//the path to views
app.set('views',path.join(__dirname, '/views'));
app.set('view engine', 'ejs');

//set engine
app.engine('ejs', ejsMate);
app.use(express.urlencoded({extended:true})) //for parsing req.body

const secret = process.env.SECRET || 'abettersecret';
//from session storage
const store=new MongoDBStore({
    url:dbUrl,
    secret,
    touchAfter : 24*60*60
})

store.on('error',function(err){
    console.log('session store error')
})

//cookies info
const sessionConfig = {
    store,
    name:'cookieName',
    secret,
    resave:false, 
    saveUninitialized:true,
    cookie: {
        httpOnly:true,
        // secure:true,  //cookies can only be configures over a secured connection https
        expires: Date.now() + 1000*60*60*24*7,
        maxAge:1000*60*60*24*7
    }  
}
app.use(session(sessionConfig))
app.use(flash()) //flash

//requiring passports
const passport=require('passport')
const localStrategy = require('passport-local');
const User = require('./models/user')
app.use(passport.initialize()); //iniltialise passport
app.use(passport.session())  //for sessions
passport.use(new localStrategy(User.authenticate())); //authentication method - all these inbuilt methods
passport.serializeUser(User.serializeUser()) //how do you store user in a session
passport.deserializeUser(User.deserializeUser()) //how to get user out of that session

//middleware for every route
app.use((req, res, next)=>{
    if(!['/login', 'register', '/'].includes(req.originalUrl)){
        req.session.returnTo = req.originalUrl;
    }
    
    res.locals.currentUser = req.user;
    res.locals.success=req.flash('success');
    res.locals.error=req.flash('error')
    next();
})

//calling routes
app.use('/', userRoutes)
app.use('/campgrounds', campgroundRoutes)
app.use('/campgrounds/:id/reviews', reviewRoutes)

//home page - welcome
app.get('/', (req, res)=>{
    res.render('home')
})


app.all('*', (req,res,next)=>{
    next(new ExpressError('Page Not found', 404))
})

app.use((err,req,res,next)=>{
    const {statusCode=500} = err;
    if(!err.message) err.message='Something went Wrong!'
    res.status(statusCode).render('error', {err});   

})

const port = process.env.PORT || 4000
app.listen(port, ()=>{
    console.log(`Serving on port ${port}`)
})