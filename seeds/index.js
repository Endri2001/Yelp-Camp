// This is an isolated file that will be used to populate the data 
const mongoose = require('mongoose')
const Campground = require("../models/camp")
const cities = require("./cities")
const {places,descriptors} = require("./seedHelpers")


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

// take the array of descriptors or places and randomly pick one
const sample = (array) =>{
    return array[Math.floor(Math.random()*array.length)]
}

const seedDb = async () =>{
    // erase database any time we run the populator
    await Campground.deleteMany({})
    for(let i = 0; i<50;i++){
        const rand = Math.floor(Math.random()*1000)
        const price = Math.floor(Math.random()*50)
       const camp = new Campground({
            location:`${cities[rand].city}, ${cities[rand].state}`,
            title: `${sample(descriptors)} ${sample(places)}`,
            // This api generates a random image from unsource splash
            image: "https://source.unsplash.com/collection/483251/1600x900",
            description:"Lorem ipsum dolor sit amet consectetur adipisicing elit. Maiores quos expedita, modi ipsam hic sint. Blanditiis beatae delectus sint dolorem. Quas excepturi, temporibus ratione facere quo reprehenderit nam molestiae ea.",
            price: price
        })
        await camp.save()
    }
}
seedDb().then(() => {
    mongoose.connection.close()
})
