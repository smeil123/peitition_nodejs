var mongoose = require('mongoose');

var boardSchema = mongoose.Schema({
    writer:String,
    title:String,
    category:{type:String},
    contents:String,
    comments:[{
        name:String,
        memo:String,
        date:{type:Date,default:Date.now}
    }],
    count:{type:Number,default:0},
    parti_cnt:{type:Number,default:0},
    start_date:{type:Date,default:Date.now},
    end_date:{type:Date,default: +new Date() + 30*24*60*60*1000}, //한달 뒤로 set필요
    deleted:{type:Boolean,default:false},//true면 삭제 된 경우,
    answer_flag:{type:Boolean,default:false}
});

module.exports = mongoose.model('BoardContents',boardSchema);
