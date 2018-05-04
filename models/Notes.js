var db = require('./../DBConnection/DBConnection');
var ObjectId = db.ObjectId;
var NotesScheme =new db.Schema({
    NOTE_ID:String,
    DATA_ID:String,
    HISTORY_NOTE:String,
    CREATE_DATE:String,
});
NotesScheme.index({NOTE_ID:1},{"background" : true});//set up a index
var NotesEntity = db.mongoose.model('NotesEntity',NotesScheme,'NOTES');
exports.NotesEntity  = NotesEntity;//export a Notes Instance
