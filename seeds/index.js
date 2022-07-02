const Campground = require('../models/campground')  //import model
const cities = require('./cities')
const {places, descriptors} = require('./seedHelpers')

//connect mongoose
const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost:27017/yelp-camp',{useNewUrlParser : true, useUnifiedTopology : true}, {useCreateIndex:true}) 

const db = mongoose.connection;
db.on('error', console.error.bind(console, "connection error: "));
db.once('open', ()=>{
    console.log("Database connected");
});

const sample = (array) => array[Math.floor(Math.random() * array.length)];

const seedDB = async () => {
    await Campground.deleteMany({});
    for (let i =0; i<250; i++){
        const random1000 = Math.floor(Math.random() * 1000);
        const price = Math.floor(Math.random() * 20) +10;
        const camp = new Campground({
            author:'62ba17f9af3feda9a816d762', //author id is for harry-potter found using db.users.find({username:'harry'})
            title: `${sample(descriptors)} ${sample(places)}`,
            location: `${cities[random1000].city}, ${cities[random1000].state}`,
            description:'Lorem ipsum dolor sit amet consectetur adipisicing elit. Id, hic.',
            price,
            geometry:{
              type:'Point',
              coordinates: [ cities[random1000].longitude, cities[random1000].latitude ]
            },
            images: [
                {
                  url: 'https://res.cloudinary.com/dtdoiorcy/image/upload/v1656618380/YelpCamp/kd0xooh69fx35tvfefm4.jpg',
                  filename: 'YelpCamp/kd0xooh69fx35tvfefm4',
                },
                {
                  url: 'https://res.cloudinary.com/dtdoiorcy/image/upload/v1656617919/YelpCamp/zi0eutqkr9uywncjlkxi.jpg',
                  filename: 'YelpCamp/zi0eutqkr9uywncjlkxi',
                }
              ]
        })
        await camp.save();
    }
}
seedDB().then(()=>{
    mongoose.connection.close();
});