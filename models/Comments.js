var db = require('./../DBConnection/DBConnection');
var ObjectId = db.ObjectId;
var CommentsScheme =new db.Schema({
    COMMENT_ID:Number,
    DATA_ID:String,
    CREATE_DATE:String,
    CREATE_BY:String,
    HISTORY_COMMENT:String,
});
CommentsScheme.index({COMMENT_ID:1},{"background" : true});//set up a index
var CommentsEntity = db.mongoose.model('CommentsEntity',CommentsScheme,'COMMENTS');
exports.CommentsEntity  = CommentsEntity;//export a Comments Instance
