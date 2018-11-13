var mongoose = require('mongoose');

var answerSchema = mongoose.Schema({
    writer:String,
    contents:String,
    count:{type:Number,default:0}, //조회수
    date:{type:Date,default:Date.now},
    petitions:{ type:mongoose.Schema.Types.ObjectId,ref:"BoardContents"}
});

module.exports = mongoose.model('Answers',answerSchema);
