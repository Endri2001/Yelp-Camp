const mongoose = require('mongoose')
// when we call schema methods we can shorten it a little bit
const Schema = mongoose.Schema

const campSchema = new Schema({
    title:String, 
    price:Number, 
    image:String,
    description:String, 
    location:String,
    reviews: [
        {
            type: Schema.Types.ObjectId,
            ref: 'Review'
        }
    ]
})


module.exports = mongoose.model("Campground",campSchema)
