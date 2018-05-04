var RestResult = function () {
    this.errorCode = RestResult.NO_ERROR;
    this.Value = {};
    this.errorReason = "";
};


RestResult.NO_ERROR = 0;
RestResult.ILLEGAL_ARGUMENT_ERROR_CODE = 1;
RestResult.BUSINESS_ERROR_CODE = 2;
RestResult.AUTH_ERROR_CODE = 3;
RestResult.SERVER_EXCEPTION_ERROR_CODE = 5;
RestResult.TARGET_NOT_EXIT_ERROR_CODE = 6;

module.exports = RestResult;