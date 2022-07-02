const mongoose =  require('mongoose');
const passportLocalMongoose = require('passport-local-mongoose');

const userSchema = new mongoose.Schema({
    email:{
        type:String,
        required:true,
        unique:true
    }
});

userSchema.plugin(passportLocalMongoose) //gives us a field of username, salt and hash password
module.exports = mongoose.model('User', userSchema)