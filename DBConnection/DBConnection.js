var db = require('../config/DBConfig');//import mongodb instance from config
var mongoose = db.mongoose;//require mongoose instance
var Schema = mongoose.Schema;//require Schema
var ObjectId = Schema.Types.ObjectId;//require ObjectId

exports.mongodb = db;//export mongodb instance
exports.mongoose = mongoose; //export mongoose instance
exports.Schema = Schema;//export Schema
exports.ObjectId = ObjectId;//export ObjectId
exports.Mixed = Schema.Types.Mixed;//export Mixed