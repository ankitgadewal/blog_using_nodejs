const mongoose= require('mongoose');
let postSchema = new mongoose.Schema({
    _id:mongoose.Schema.Types.ObjectId,
    title:String,
    description:String,
    authorid:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User'
    },
    authorname:String
});
module.exports=mongoose.model('posts', postSchema);