var express = require('express');
var router = express.Router();
var ApplicationEntity = require('../models/Application').ApplicationEntity;
var nodeExcel = require('excel-export');

/*
    定义导出Excel表所需要的配置信息
 */
var conf = {};

conf.name = 'PerficientTrainingAgreement';

var fields = ['EMP_ID','EMP_NAME','CHINESE_NAME','IDENTIFICATION','TRAINING_PROGRAM','TRAINING_PERIOD_FROM','TRAINING_PERIOD_TO','SERVICE_PERIOD_FROM','SERVICE_PERIOD_TO',
    'CREATE_DATE','STATUS','REJECT_NOTES','TRAINING_INSTITUTION','TOTAL_COST','COMPANY_COVER','COMPANY_COVER_RATE'];

// 定义Excel表的列名和列类型
conf.cols = [
    {caption:'EMP_ID', type:'string',  width:50.00},
    {caption:'EMP_NAME', type:'string',  width:50.00},
    {caption:'CHINESE_NAME', type:'string',  width:50.00},
    {caption:'IDENTIFICATION', type:'string',  width:50.00},
    {caption:'TRAINING_PROGRAM', type:'string',  width:50.00},
    {caption:'TRAINING_PERIOD_FROM', type:'string',  width:50.00},
    {caption:'TRAINING_PERIOD_TO', type:'string',  width:50.00},
    {caption:'SERVICE_PERIOD_FROM', type:'string', width:50.00},
    {caption:'SERVICE_PERIOD_TO', type:'string',  width:50.00},
    {caption:'CREATE_DATE', type:'string',  width:50.00},
    {caption:'STATUS', type:'string',  width:50.00},
    {caption:'REJECT_NOTES', type:'string',  width:50.00},
    {caption:'TRAINING_INSTITUTION', type:'string',  width:50.00},
    {caption:'TOTAL_COST', type:'number', beforeCellWrite: function(row, cellData) { return cellData;}, width:50.00},
    {caption:'COMPANY_COVER', type:'number', beforeCellWrite: function(row, cellData) { return cellData;}, width:50.00},
    {caption:'COMPANY_COVER_RATE', type:'string',  width:50.00}

];

// 定义每一行的数据
conf.rows = [];


/*
    映射导出Excel的URL路径
 */
router.post('/export/:EXPORT_TYPE', function (req, res) {
    // 填充数据
    var reportData = JSON.parse(req.body.reportData);
    var array = [];
    for (var i = 0; i < reportData.length; i++) {
        var a = [];
        for (var j = 0; j < fields.length; j++) {
            a.push(reportData[i][fields[j]]);
            //a.push(i + "," +j);
        }
        array.push(a);
    }
    conf.rows = array;

    var result = nodeExcel.execute(conf);

    var date = new Date();
    var time = date.getFullYear() + "-" + (date.getMonth()+1) + "-" + date.getDate();
    res.setHeader('Content-Type', 'application/vnd.openxmlformats');
    res.setHeader("Content-Disposition", "attachment; filename=" + "Report_" + req.params.EXPORT_TYPE + "_" + time + ".xlsx");
    res.end(result, 'binary');
});

module.exports = router;