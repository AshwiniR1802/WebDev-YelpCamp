const passport = require('passport');
const User = require('../models/user');

//register - get req
module.exports.renderRegister = (req, res)=>{
    res.render('users/register')
}

//register - post req
module.exports.register = async (req, res, next)=>{
    try{
        const {email, username, password} = req.body;
        const user = new User({email,username});
        const registeredUser = await User.register(user, password); //adds salt, hashes
        //directly logins the user after registration - req.login
        req.login(registeredUser, err =>{
            if(err) return next(err);
            req.flash('success', 'Welcome to Yelp-Camp!')
            res.redirect('/campgrounds')
        }) 
    }
    catch(err){
        req.flash('error', err.message)
        res.redirect('/register')
    }
}

//login - get req
module.exports.renderLogin =  (req, res)=>{
    res.render('users/login')
}

//login - post req
module.exports.login =  (req, res)=>{
    req.flash('success', 'Welcome back!');
    const redirectUrl = req.session.returnTo || '/campgrounds';
    delete req.session.returnTo;
    res.redirect(redirectUrl);
};

//logout
module.exports.logout =  (req, res)=>{
    req.logout(function(err){
        if(err) {return next(err)};
    });
    req.flash('success', 'Successfully Logged Out!')
    res.redirect('/campgrounds')
};