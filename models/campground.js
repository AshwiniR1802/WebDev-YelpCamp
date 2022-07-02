const mongoose =  require('mongoose');
const Review = require('./review');
const Schema = mongoose.Schema;

const ImageSchema = new Schema({
    url:String,
    filename:String
})

// https://res.cloudinary.com/dtdoiorcy/image/upload/v1656587046/YelpCamp/mbmfasaqww24dtwjocdx.jpg - original link
//changing the image to particular size while importig from cloudinary
ImageSchema.virtual('thumbnail').get(function(){
    return this.url.replace('/upload', '/upload/w_200');
})

const opts = {toJSON: {virtuals:true}} //includes the virtuals in schema

const CampGroundSchema = new Schema({
    title: String,
    images: [ImageSchema],
    price: Number,
    description: String,
    location: String,
    geometry:{
        type:{
            type: String,
            enum : ['Point'], //location is stored s type - point and [longitude, latitude]
            required:true
        },
        coordinates:{
            type:[Number],
            required:true
        }
    },
    author:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User'
    },
    reviews:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Review'
    }]
}, opts);

// for cluster maps popup, we define virtual properties, in campgroundschema, which directly edits the text for us
CampGroundSchema.virtual('properties.popupMarkup').get(function(){
    return `<strong><a href="/campgrounds/${this._id}">${this.title}</a></strong>
    <p>${this.description.substring(0, 20)}...</p>`;
})


CampGroundSchema.post('findOneAndDelete', async function(doc){
    if(doc){
        await Review.deleteMany({
            _id:{
                $in:doc.reviews
            }
        })
    }
})
module.exports=mongoose.model('Campground', CampGroundSchema);