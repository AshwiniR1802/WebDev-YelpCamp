const { cloudinary } = require('../cloudinary');
const Campground = require('../models/campground')
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding')
const mapBoxToken = process.env.MAPBOX_TOKEN;
const geocoder = mbxGeocoding({accessToken : mapBoxToken});

//show all campgrounds
module.exports.index=async (req, res)=>{
    const campgrounds = await Campground.find({});
    res.render('campgrounds/index', {campgrounds})
};

//get req
//adding a new campground
module.exports.renderNewForm = (req, res)=>{
    res.render('campgrounds/new') 
};

//post req
//use joi for server side validations
module.exports.createCampground = async (req, res, next)=>{
    // the process of identifying a specific location based on a street address
    const geoData = await geocoder.forwardGeocode({
        query:req.body.campground.location,
        limit:1
    }).send()
    const campground = new Campground(req.body.campground); //req.body.campground is obj about title, price, description, img, etc.
    // if(!req.body.campground) throw new ExpressError('Invalid Campground Data', 400)
    campground.geometry = geoData.body.features[0].geometry; //array - longitute, latitude
    campground.images = req.files.map(f=>({url:f.path, filename:f.filename}))
    campground.author = req.user._id;
    console.log(campground)
    await campground.save();
    req.flash('success', 'Successfully created a new campground!');
    res.redirect(`/campgrounds/${campground._id}`)
}

//get details of campgrounds
module.exports.showCampgrounds = async(req, res)=>{
    const campground = await Campground.findById(req.params.id).populate({path:'reviews', populate:{path:'author'}}).populate('author'); //nested populate - populate author for each review, other populate - show author for each campground
    if(!campground){
        req.flash('error', 'Cannot find that Campground');
        return res.redirect('/campgrounds')
    }
    console.log(campground)
    res.render('campgrounds/show', {campground});
};

//for editing a campground - get req
module.exports.renderEditForm = async (req, res)=>{
    const {id} = req.params;
    const campground=await Campground.findById(id);
    // const campground = await Campground.findById(req.params.id);
    if(!campground){
        req.flash('error', 'Cannot find that Campground');
        return res.redirect('/campgrounds')
    }
    res.render('campgrounds/edit', {campground})
}

//for editing a campground - put req
module.exports.updateCampground = async(req, res)=>{
    const {id} = req.params;
    const campground = await Campground.findByIdAndUpdate(id, {...req.body.campground})
    const imgs = req.files.map(f=>({url:f.path, filename:f.filename}));
    campground.images.push(...imgs); //to push images from form
    await campground.save();
    if(req.body.deleteImages){
        //to delete the images from form and cloudinary
        for(let filename of req.body.deleteImages){
            await cloudinary.uploader.destroy(filename);
        }
        await campground.updateOne({ $pull: { images: { filename: { $in: req.body.deleteImages}}}})
        // console.log(campground)
    }
    req.flash('success', 'Successfully updated a campground!');
    res.redirect(`/campgrounds/${campground._id}`)
}

//deleting a campground
module.exports.deleteCampground = async(req, res)=>{
    const {id} = req.params;
    await Campground.findByIdAndDelete(id);
    req.flash('success', 'Successfully deleted campground!');
    res.redirect('/campgrounds');
}