var db = require('./../DBConnection/DBConnection');
var ObjectId = db.ObjectId;
var ApplicationScheme = new db.Schema({
    DATA_ID: String,
    EMP_ID: String,
    EMP_NAME: String,
    APPROVER: String,
    CC: String,
    TRAINING_PROGRAM: String,
    TOTAL_COST: Number,
    COMPANY_COVER: Number,
    TRAINING_PERIOD_FROM: String,
    TRAINING_PERIOD_TO: String,
    SET_PERIOD: String,
    SERVICE_PERIOD_FROM: String,
    SERVICE_PERIOD_TO: String,
    REASON: String,
    CREATE_DATE: String,
    CREATE_BY: String,
    UPDATE_DATE: String,
    UPDATE_BY: String,
    STATUS: String,
    REJECT_NOTES: String,
    TRAINING_INSTITUTION: String,
    COMPANY_COVER_RATE: String,
    CHINESE_NAME: String,
    IDENTIFICATION: String,
    TOTAL_COST_CN: String,
    COMPANY_COVER_CN: String,
    YEAR_CN: String,
    MONTH_CN: String,
    DAY_CN: String,
    REJECTED: String,
    COMMENTS: String,
    COMMENTED: String,
    certification: String,
    SCANNING: String
});
ApplicationScheme.index({EMP_NAME: 1}, {"background": true});//set up a index
var ApplicationEntity = db.mongoose.model('ApplicationEntity', ApplicationScheme, 'APPLICATIONS');
exports.ApplicationEntity = ApplicationEntity;//export a Application Instance