var mongoose = require('mongoose');//import mongoose repository
mongoose.connect('mongodb://127.0.0.1:27017/test');//mongodb address
exports.mongoose = mongoose;//iexport mongoose instance