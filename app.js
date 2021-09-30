const express = require('express')
const path = require('path')
const morgan = require("morgan")
const mongoose = require('mongoose')
const ejsMate = require("ejs-mate")
const methodOverride = require('method-override')

const Campground = require("./models/camp")
const Review = require("./models/review")

const YelpError = require("./utilities/YelpError")
const {campgroundSchema,reviewSchema} = require ("./schemas.js")



// Setting up database connection
mongoose.connect("mongodb://localhost:27017/yelp",{
    useNewUrlParser:true,
    // removes the deprecation warnings from mongodb
    useCreateIndex:true,
    // use MongoDb driver's new connection managment engine
    useUnifiedTopology:true
})

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
    console.log("DATABASE CONNECTED")
});

const app = express()

// tell express what engine to use to parse the ejs file
app.engine("ejs",ejsMate)
// set the views folder as the path for files 
app.set('view engine', 'ejs')
app.set('views',path.join(__dirname,'views'))

// parse req.body
app.use(express.urlencoded({extended:true}))
app.use(express.json())
app.use(methodOverride("_method"))
app.use(morgan('dev'))


app.get("/", (req, res)=>{
    res.render("home")
})

const validateCampground = function(req, res,next){
    const {error} = campgroundSchema.validate(req.body)
    if(error){
        // piece together the error message
        const msg = error.details.map(el=>el.message).join(",")
        throw new YelpError(msg,400)
    }else{
        next()
    }
}
const validateReview = function(req,res,next){
    const {error} = reviewSchema.validate(req.body)
    if(error){
        // piece together the error message
        const msg = error.details.map(el=>el.message).join(",")
        throw new YelpError(msg,400)
    }else{
        next()
    }

}

// display all camps
app.get("/campgrounds", async (req, res,next)=>{
    try{
        const data = await Campground.find({})
        res.render("campgrounds/index",{data})
    }catch(e){
        next(e)
    }
})

// create new campground
app.get("/campgrounds/new", (req, res)=>{
    res.render("campgrounds/new")
})

// display individual camps
app.get("/campgrounds/:id", async (req, res,next)=>{
    try{
        const {id} = req.params 
        // we populate campground so we pass the reviews to the template as well
        const campground = await Campground.findById(id).populate("reviews")
        res.render("campgrounds/show",{campground})
    }catch(e){
        next(e)
    }
})

// show the edit page for each camp
app.get("/campgrounds/:id/edit", async (req, res,next)=>{  
    try{
        const {id} = req.params
        const campground = await Campground.findById(id)
        res.render("campgrounds/edit", {campground}) 
    }catch(e){
        next(e)
    }
})

// update camp route
app.put("/campgrounds/:id",validateCampground,async (req, res,next)=>{
    try{
        const {id} = req.params
        const changed =  await Campground.findByIdAndUpdate(id,req.body.campground,{new:true})
        res.redirect(`/campgrounds/${changed._id}`)
    }catch(e){
        next(e)
    }
})

// create a new camp
app.post("/campgrounds",validateCampground,async (req, res,next)=>{
    try{
        const campground = new Campground(req.body.campground)
        await campground.save()
        res.redirect(`/campgrounds/${campground._id}`)
    }catch(e){
        next(e)
    }
})

// delete camp route
app.delete("/campgrounds/:id",async (req, res,next)=>{
    try{
        const {id} = req.params
        await Campground.findByIdAndDelete(id)
        res.redirect("/campgrounds")
    }catch(e){
        next(e)
    }
})

app.post("/campgrounds/:id/reviews", validateReview, async(req,res,next)=>{
    try{
        const {id} = req.params
        const campground = await Campground.findById(id)
        const review = new Review(req.body.review)
        campground.reviews.push(review)

        await review.save()
        await campground.save()

        res.redirect(`/campgrounds/${id}`)
    }catch(e){
        next(e)
    }
    
})

// For all requests that does not match to our other routes 
app.all("*",(req, res, next)=>{
    next(new YelpError("Page Not Found",404))
})

// Error handling route
app.use((err, req, res,next)=>{
    const {status = 500,message = "Oops, something went wrong"} = err

    if(!err.message){
        err.message = "Oops, something went wrong"
    }
    // pass the erorr to our error template
    res.status(status).render('error',{err})
})


app.listen(3000,()=>{
    console.log("port 3000 works")
})