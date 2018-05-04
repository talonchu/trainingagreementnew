var db = require('./../DBConnection/DBConnection');
var ObjectId = db.ObjectId;
var EmployeeScheme =new db.Schema({
    EMP_ID:String,
    EMP_NAME:String,
});
EmployeeScheme.index({EMP_NAME:1},{"background" : true});//set up a index
var EmployeeEntity = db.mongoose.model('EmployeeEntity',EmployeeScheme,'EMPLOYEE');
exports.EmployeeEntity  = EmployeeEntity;//export a Employee Instance