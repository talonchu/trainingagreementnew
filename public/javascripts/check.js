function checkChineseName(chineseName, _id) {
    var id = (_id === undefined || _id === null) ? "" : _id;
    if (chineseName.length === 0) {
        $('#chineseName' + id).css("border-color", "");
        $("#warning" + id).css("display", "none");
        $('#msg' + id).html("");
        return "";
    }
    var reg = /^[\u4E00-\u9FA5]+$/;
    if (reg.test(chineseName)) {
        $('#chineseName' + id).css("border-color", "");
        $("#warning" + id).css("display", "none");
        $('#msg' + id).html("");
        return "";
    }
    $('#chineseName' + id).css("border-color", "red");
    $("#warning" + id).css("display", "block");
    $('#msg' + id).html("Please fill out the name in Chinese.");
}

function checkIdNumber(idNumber, _id) {
    var id = (_id === undefined || _id === null) ? "" : _id;
    if (idNumber.length === 0) {
        $('#idNumber' + id).css("border-color", "");
        $("#warning" + id).css("display", "none");
        $('#msg' + id).html("");
        return "";
    }
    var reg = /^[1-9]\d{5}(18|19|([23]\d))\d{2}((0[1-9])|(10|11|12))(([0-2][1-9])|10|20|30|31)\d{3}[0-9Xx]$/;
    if (reg.test(idNumber)) {
        $('#idNumber' + id).css("border-color", "");
        $("#warning" + id).css("display", "none");
        $('#msg' + id).html("");
        return "";
    }
    $('#idNumber' + id).css("border-color", "red");
    $("#warning" + id).css("display", "block");
    $('#msg' + id).html("The ID number you typed is incorrect. Please retype your ID number.");
}

function checkTime(_trainingPeriodFrom, _trainingPeriodTo) {
    var trainingPeriodFrom = _trainingPeriodFrom;
    var trainingPeriodTo = _trainingPeriodTo;
    if (trainingPeriodFrom.length === 0 || trainingPeriodTo.length === 0) {
        $('#trainingPeriodFrom').css("border-color", "");
        $('#trainingPeriodTo').css("border-color", "");
        $("#warning").css("display", "none");
        $('#msg').html("");
        return "";
    }
    var dtArr1 = trainingPeriodFrom.split("/");
    var dtArr2 = trainingPeriodTo.split("/");
    var dt1 = new Date(dtArr1[0], dtArr1[1] - 1, dtArr1[2]);
    var dt2 = new Date(dtArr2[0], dtArr2[1] - 1, dtArr2[2]);
    if (dt1 <= dt2) {
        $('#trainingPeriodFrom').css("border-color", "");
        $('#trainingPeriodTo').css("border-color", "");
        $("#warning").css("display", "none");
        $('#msg').html("");
        return "";
    }else{
        $('#trainingPeriodFrom').css("border-color", "red");
        $('#trainingPeriodTo').css("border-color", "red");
        $("#warning").css("display", "block");
        $('#msg').html("End training period should be later than begin training period.");
    }
}

function checkOrganization(organization){
    var ok = true;
    if (organization === 0) {
        ok = false;
        $('#trainingOrganization').css("border-color", "red");
    }
    else
        $('#trainingOrganization').css("border-color", "");
    if (ok)
        return "";
}

function checkProgram(program){
    var ok = true;
    if (program === 0) {
        ok = false;
        $('#trainingProgram').css("border-color", "red");
    }
    else
        $('#trainingProgram').css("border-color", "");
    if (ok)
        return "";
}

function checkAll(application, _id) {
    var id = (_id === undefined || _id === null) ? "" : _id;
    var ok = true;
    if (application.CHINESE_NAME.length === 0) {
        ok = false;
        $('#chineseName' + id).css("border-color", "red");
    }
    if (application.IDENTIFICATION.length === 0) {
        ok = false;
        $('#idNumber' + id).css("border-color", "red");
    }
    if (application.TRAINING_INSTITUTION.length === 0) {
        ok = false;
        $('#trainingOrganization' + id).css("border-color", "red");
    }
    else
        $('#trainingOrganization' + id).css("border-color", "");
    if (application.TRAINING_PROGRAM.length === 0) {
        ok = false;
        $('#trainingProgram' + id).css("border-color", "red");
    }
    else
        $('#trainingProgram' + id).css("border-color", "");
    if (application.TOTAL_COST.length === 0) {
        ok = false;
        $('#totalCost' + id).css("border-color", "red");
    }
    if (application.TRAINING_PERIOD_FROM.length === 0) {
        ok = false;
        $('#trainingPeriodFrom' + id).css("border-color", "red");
    }
    if (application.TRAINING_PERIOD_TO.length === 0) {
        ok = false;
        $('#trainingPeriodTo' + id).css("border-color", "red");
    }
    if (ok)
        return "";
    return "The fields with ' * ' cannot be blank.";
}

function getServicePeriodFrom(trainingPeriodTo) {
    trainingPeriodTo = $('#trainingPeriodTo').val();
    if (trainingPeriodTo.length === 0)
        return "";
    var time = new Date(trainingPeriodTo);
    time = time.valueOf();
    time = time + 1 * 24 * 60 * 60 * 1000;
    time = new Date(time);
    var month = time.getMonth() + 1;
    if (month.toString().length === 1)
        month = "0" + month;
    var day = time.getDate();
    if (day.toString().length === 1)
        day = "0" + day;
    $('#servicePeriodFrom').val(time.getFullYear() + "-" + month + "-" + day);
    return time.getFullYear() + "-" + month + "-" + day;
}

function getServicePeriodTo(trainingPeriodTo, setPeriod) {
    trainingPeriodTo = $('#trainingPeriodTo').val();
    setPeriod = $('#period').val();
    if (trainingPeriodTo.length === 0 || setPeriod.length === 0)
        return "";
    var time = trainingPeriodTo.split("-");
    var year = parseInt(time[0]);
    var month = parseInt(time[1]);
    var day = parseInt(time[2]);
    if (setPeriod === "12 months")
        year = year + 1;
    else if (month > 6) {
        year = year + 1;
        month = month - 6;
    }
    else
        month = month + 6;
    if (month === 2 && day === 29)
        day--;
    if (month < 10)
        month = "0" + month;
    if (day < 10)
        day = "0" + day;
    $('#servicePeriodTo').val(year + "-" + month + "-" + day);
    return year + "-" + month + "-" + day;
}

$('#cc').keydown(function (event) {
    if (event.keyCode !== 8) {
        return;
    }
    var bodyText = $(this)[0];
    var bodyField = $(this).val();
    var pos = getCursortPosition(bodyText);
    delWholeWord(bodyText, bodyField, pos);
    return;
});

$('#ccEdit').keydown(function (event) {
    if (event.keyCode !== 8) {
        return;
    }
    var bodyText = $(this)[0];
    var bodyField = $(this).val();
    var pos = getCursortPosition(bodyText);
    delWholeWord(bodyText, bodyField, pos);
    return;
});

$('#ccAdmin').keydown(function (event) {
    if (event.keyCode !== 8) {
        return;
    }
    var bodyText = $(this)[0];
    var bodyField = $(this).val();
    var pos = getCursortPosition(bodyText);
    delWholeWord(bodyText, bodyField, pos);
    return;
});

$('#ccAdminEdit').keydown(function (event) {
    if (event.keyCode !== 8) {
        return;
    }
    var bodyText = $(this)[0];
    var bodyField = $(this).val();
    var pos = getCursortPosition(bodyText);
    delWholeWord(bodyText, bodyField, pos);
    return;
});

function isExist(empName, cid) {
    var temp = ($('#' + cid).val() + "").split(';');
    var len = temp.length;
    for (i = 0; i < len; i++) {
        if (temp[i] === empName)
            return true;
    }
    return false;
}

function IsFloat(obj) {
    obj.value = (obj.value + "").replace(/[^\d.]/g, "");
    obj.value = (obj.value + "").replace(/^\./g, "");
    obj.value = (obj.value + "").replace(/^0/g, "0.");
    obj.value = (obj.value + "").replace(/\.{2,}/g, ".");
    obj.value = (obj.value + "").replace(".", "$#$").replace(/\./g, "").replace("$#$", ".");
    var strs = "";
    var midd = "";
    var count = 0;
    for (var i = 0; i < (obj.value + "").length; i++) {
        if ((obj.value + "").charAt(i) === ".") {
            midd = "start";
        }
        if (midd === "start") {
            count++;
        }
        if (count === 4) {
            break;
        }
        strs += (obj.value + "").charAt(i);
    }
    obj.value = strs;
}

function AngelMoney(st) {
    if (st === "") {
        return "";
    }
    var s = st;
    if (st.charAt(0) === '0' && st.charAt(1) !== '.') {
        return "";
    }
    s = s.replace(/^(\d*)$/, "$1.");
    s = (s + "00").replace(/(\d*\.\d\d)\d*/, "$1");
    s = s.replace(".", ",");
    var re = /(\d)(\d{3},)/;
    while (re.test(s))
        s = s.replace(re, "$1,$2");
    s = s.replace(/,(\d\d)$/, ".$1");
    return s.replace(/^\./, "0.");
}
