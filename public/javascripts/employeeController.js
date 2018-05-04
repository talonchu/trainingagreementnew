var employeeControllers = angular.module('employeeControllers', [])

//Employee List
employeeControllers.controller("EmployeeListCtrl", ["$scope", "$http", "$timeout", "$filter", "$location",
    function ($scope, $http, $timeout, $filter, $location) {
        $('#empClass').attr('class', 'active');
        $('#allClass').removeAttr('class', 'active');
        $('#addClass').removeAttr('class', 'active');
        $('#approverClass').removeAttr('class', 'active');
        $scope._position = {};
        var login_name = $('#login_name').text();
        //admin view the pdf
        $scope.viewFile = function (ve) {
            window.open("approve/viewScanning/viewFile?=" + ve.file);
        }
        $scope.isok = false;
        $scope.warningMsg = "";
        //GET ALL CERTIFICATION FROM TPT
        $http({
            method: 'JSONP',
            url: 'http://10.2.1.74:8080/tpt2013-portlet/resteasy/certification/all?callback=JSON_CALLBACK'
        }).success(function (response) {
            var allCerts = angular.fromJson(response);
            var programList = new Array();
            for (var i = 0; i < allCerts.length; i++) {
                var p = new Object();
                p.programName = allCerts[i].certificationName;
                programList.push(p);
            }
            $scope.allProgram = programList;
        }).error(function () {

        });

        //GET Employee info FROM TPT
        $http({
            method: 'JSONP',
            url: 'http://10.2.1.74:8080/tpt2013-portlet/resteasy/employees?callback=JSON_CALLBACK'
        }).success(function (response) {
            var EmpInfo = angular.fromJson(response);
            for (var i = 0; i < EmpInfo.length; i++) {
                if (EmpInfo[i].screenName === login_name) {
                    $scope.empid = EmpInfo[i].emid;
                    $scope.empname = EmpInfo[i].screenName;
                    setCookie("EMP_ID", $scope.empid, 365);
                    setCookie("EMP_NAME", $scope.empname, 365);
                }
            }

            //Send request to database
            $http({
                method: 'get',
                url: '/employee/list/' + $scope.empid + '/' + $scope.empname,
                headers: {'Content-Type': 'application/x-www-form-urlencoded'}
            }).success(function (response) {
                $scope.employeeApplications = eval(response);
                $scope.sum = response.length;
                var data = eval(response);
                var emp_id = data[0].EMP_ID;
                var emp_name = data[0].EMP_NAME;
                /*setCookie("EMP_ID", emp_id, 365);
                 setCookie("EMP_NAME", emp_name, 365);*/
            }).error(function () {
                console.log('fecth failed');
            });

            //put the user information in a Cookie
            function setCookie(c_name, value, expiredays) {
                var exdate = new Date()
                exdate.setDate(exdate.getDate() + expiredays)
                document.cookie = c_name + "=" + escape(value) +
                    ((expiredays == null) ? "" : ";expires=" + exdate.toGMTString())
            }

            //Get URL Param
            $scope.getUrlParam = function (name) {
                var after = window.location.hash.split("?")[1];
                if (after) {
                    var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)");
                    var r = after.match(reg);
                    if (r != null) {
                        return decodeURIComponent(r[2]);
                    } else {
                        return null;
                    }
                }
            };

            var param_rec_id_str = "rec_id";
            var param_rec_id = $scope.getUrlParam(param_rec_id_str);
            if(param_rec_id != null){
                $http({
                    method: 'post',
                    url: 'record/'+ param_rec_id +'/getApplication',
                    headers: {'Content-Type': 'application/x-www-form-urlencoded'}
                }).success(function (response) {
                    $scope.view(response);
                }).error(function () {
                    console.log('fecth failed');
                });
            }

            //Employee List each item's detail
            $scope.view = function (member) {
                $("#viewAgreementPanel" + member._id).dialog(
                    {
                        height: 800,
                        width: 1200,
                        modal: true,
                        buttons: {
                            "Cancel": function () {
                                $(this).dialog("destroy");
                            }
                        },
                        resizable: false,
                        open: function (event, ui) {
                            $(".ui-dialog-titlebar-close", $(this).parent()).hide();
                            /*$(this).css('overflow','hidden');*/
                            $(".ui-dialog-title").html(member.EMP_NAME + " - " + member.TRAINING_PROGRAM);
                            $http({
                                method: 'get',
                                url: '/employee/comment/' + member.EMP_ID + '/' + member.EMP_NAME + '/' + member._id + '/comment',
                                headers: {'Content-Type': 'application/x-www-form-urlencoded'}
                            }).success(function (response) {
                                $scope.comments = response;
                            });
                            $http({
                                method: 'post',
                                url: '/approve/getScannings/' + member._id,
                                headers: {'Content-Type': 'application/x-www-form-urlencoded'}
                            }).success(function (response) {
                                $scope.picFile = response;
                            });
                        }
                    }
                );
            }

            $scope.checkChineseName = function (chineseName, role, id) {
                return checkChineseName(chineseName, role, id);
            };

            $scope.checkIdNumber = function (identification, role, id) {
                return checkIdNumber(identification, role, id);
            };


            $scope.checkTime = function (trainingPeriodFrom, trainingPeriodTo, role, id) {
                return checkTime(trainingPeriodFrom, trainingPeriodTo, role, id);
            };

            $scope.checkAll = function (application, role, id) {
                return checkAll(application, role, id);
            };

            $scope.checkDisplay = function (_id, _position) {
                $scope.warningMsg = "";
                var chineseNameCheck = $scope.checkChineseName(_position.CHINESE_NAME, "", _id);
                if (chineseNameCheck !== "" && $scope.warningMsg === "")
                    $scope.warning = chineseNameCheck;
                var idNumberCheck = $scope.checkIdNumber(_position.IDENTIFICATION, "", _id);
                if (idNumberCheck !== "" && $scope.warningMsg === "")
                    $scope.warningMsg = idNumberCheck;
                var timeCheck = $scope.checkTime(_position.TRAINING_PERIOD_FROM, _position.TRAINING_PERIOD_TO, "", _id);
                if (timeCheck !== "" && $scope.warningMsg === "")
                    $scope.warningMsg = timeCheck;
                if ($scope.submitted) {
                    var allCheck = $scope.checkAll(_position, "", _id);
                    if (allCheck !== "") {
                        if ($scope.warningMsg === "")
                            $scope.warningMsg = allCheck;
                    } else
                        $scope.submitted = false;
                }
                if ($scope.isok && $scope.warningMsg === "") {
                    $('#trainingProgram' + _id).css("border-color", "red");
                    $scope.warningMsg = "Your application of the training program already exists";
                }
                if ($scope.warningMsg === "")
                    return "none";
                return "block";
            };

            $scope.change = function () {
                $('#trainingProgram').css("border-color", "");
                $scope.isok = false;
            };

            $scope.toJSON = function (_position) {
                $scope._position.REASON = _position.REASON.replace(/\\/g, 'exchangesprit');
                $scope._position.REASON = _position.REASON.replace(/\//g, 'exchangeversprit');
                $scope._position.REASON = _position.REASON.replace(/\n/g, 'exchangeenter');
                $scope._position.REASON = _position.REASON.replace(/\r/g, 'exchanger');
                $scope._position.REASON = _position.REASON.replace(/\"/g, 'exchangeyin');
                $scope._position.TRAINING_INSTITUTION = _position.TRAINING_INSTITUTION.replace(/\"/g, 'exchangeyin');
                $scope._position.TRAINING_INSTITUTION = _position.TRAINING_INSTITUTION.replace(/\\/g, 'exchangesprit');
                $scope._position.TRAINING_INSTITUTION = _position.TRAINING_INSTITUTION.replace(/\//g, 'exchangeversprit');
                $scope._position.TRAINING_PROGRAM = _position.TRAINING_PROGRAM.replace(/\"/g, 'exchangeyin');
                $scope._position.TRAINING_PROGRAM = _position.TRAINING_PROGRAM.replace(/\\/g, 'exchangesprit');
                $scope._position.TRAINING_PROGRAM = _position.TRAINING_PROGRAM.replace(/\//g, 'exchangeversprit');
                return $filter('json')($scope._position);
            };

            $scope.submit = function (id, member) {
                $scope.submitted = true;
                member.STATUS = 'submitted';
                member.SCANNING = $scope.picFile_records;
                member.TRAINING_PROGRAM = $('#trainingProgram' + id).val();
                member.TRAINING_PERIOD_FROM = $('#trainingPeriodFrom' + id).val();
                member.TRAINING_PERIOD_TO = $('#trainingPeriodTo' + id).val();
                member.REASON = $('#reason' + id).val();
                if ($scope.checkDisplay(id, member) === "block")
                    return;
                if($('#kv-explorer'+id).val()){
                    $("#submitForm").click();
                }else{
                    $http({
                        method: 'POST',
                        url: '/employeeModified/update/' + encodeURIComponent(member) + '/update',
                        data:{application: member}
                    }).success(function (data, status) {
                        window.location.href = "/";
                    });
                }
            };

            $scope.focusProgram = function (_id) {
                if ($('#trainingProgram' + _id).is(":focus")) {
                    return;
                }
                $('#trainingProgram' + _id).dropdown('toggle');
            };

            $scope.setProgram = function (program, position) {
                $scope.employeeApplications[position].TRAINING_PROGRAM = program;
                $scope._position.TRAINING_PROGRAM = program;
            };

            //select new images
            $scope.uploadFileNew = function (file) {
                $scope.picFile_new = file;
            }
            //remove old images
            $scope.removeFile = function (file) {
                console.log(file.file)
                for (var i = 0; i < $scope.picFile_records.length; i++) {
                    if (file.file === $scope.picFile_records[i]) {
                        //remove old file when click the 'X' icon
                        $scope.picFile_records.splice(i, 1);
                    }
                }
            }
            // show edit agreement panel
            $scope.showEditAgreement = function (id, position, name, program, member) {
                $scope.activeDateTimePicker(id, position);
                $scope.member = member;
                $("#editAgreementPanel" + id).dialog(
                    {
                        height: 800,
                        width: 1200,
                        modal: true,
                        buttons: {
                            "Resubmit": function () {
                                $scope.submit(id, member);
                            },

                            "Cancel": function () {
                                $(this).dialog("destroy");
                            }
                        },
                        resizable: false,
                        open: function (event, ui) {
                            var application = {};
                            $("#kv-explorer"+id).fileinput({
                                'uploadUrl': '/employeeAdd/save/' + encodeURIComponent(application) + '/save',
                                overwriteInitial: false,
                                initialPreviewAsData: true,
                                uploadAsync: false,
                                showUpload:true,
                                dropZoneEnabled:false
                            });
                            $('#kv-explorer'+id).on('filebatchuploadsuccess', function (event, data, previewId, index) {
                                var fileNames = [];
                                if(data.files){
                                    data.files.forEach(function (file) {
                                        fileNames.push(file.name)
                                    })
                                }
                                $http(
                                    {
                                        method: 'POST',
                                        url: '/employeeModified/update/' + encodeURIComponent($scope.member) + '/update',
                                        data: {fileNames:fileNames, application: $scope.member}
                                    }
                                ).success(function (data,status) {
                                    window.location.href = "/";
                                });
                            });
                            $(".ui-dialog-titlebar-close", $(this).parent()).hide();
                            $(".ui-dialog-buttonset>button").blur();
                            $(".ui-dialog-title").html(name + " - " + program);
                            $http({
                                method: 'post',
                                url: '/approve/getScannings/' + id,
                                headers: {'Content-Type': 'application/x-www-form-urlencoded'}
                            }).success(function (response) {
                                console.log(response)
                                $scope.picFile_records = response;
                            });
                        }
                    }
                );
            };
            //init the "training period from /training period to" input field to active date picker component
            $scope.activeDateTimePicker = function (_id, _position) {
                $("#trainingPeriodFrom" + _id).datetimepicker({
                    format: 'Y/m/d',
                    formatDate: 'Y/m/d',
                    timepicker: false,
                    onSelectDate: function () {
                        $("#trainingPeriodFrom" + _id).trigger("change");
                        $scope._position.TRAINING_PERIOD_FROM = $("#trainingPeriodFrom" + _id).val();
                    }
                });

                $("#trainingPeriodTo" + _id).datetimepicker({
                    format: 'Y/m/d',
                    formatDate: 'Y/m/d',
                    timepicker: false,
                    onSelectDate: function () {
                        $("#trainingPeriodTo" + _id).trigger("change");
                        $scope._position.TRAINING_PERIOD_TO = $("#trainingPeriodTo" + _id).val();
                    }
                });
            };
            //click to change color
            $scope.focusme = function (ve) {
                $('#tbodyemployee').find('tr').not(document.getElementById(ve)).css('background', '');
                $('#' + ve).css('background', '#E1E7EC');
            };


        }).error(function () {
        });

        $scope.checkAgreement = function (ve) {
            $scope.agreement = ve;
            $('#employeelist').css("display", "none");
            $('#agreetab').css("display", "block");
            $('#agreetab').addClass('active');
            if ($scope.getAgreementType(ve) == '50Percent') {
                $('#agreement50').css("display", "block");
            } else if ($scope.getAgreementType(ve) == '100Percent') {
                $('#agreement100').css("display", "block");
            } else {
                $('#agreementAgile').css("display", "block");
            }
        };

        // Agile Agreement Types
        $scope.agileAgreementTypes = [
            'Certified Scrum Master (CSM)',
            'Certified Scrum Product Owner (CSPO)',
            'Certified Scrum Developer (CSD)',
            'Certified Scrum Trainer (CST)',
            'Certified Scrum Professional (CSP)'];

        // Get the agreement type to determine include which agreement template
        $scope.getAgreementType = function (ve) {
            ve.TOTAL_COST_CN = $scope.changeToCHN(ve.TOTAL_COST);
            ve.COMPANY_COVER_CN = $scope.changeToCHN(ve.COMPANY_COVER);
            ve.CREATE_DATE = $scope.splitToDate(ve.CREATE_DATE);
            ve.YEAR_CN = $scope.splitToYear(ve.CREATE_DATE);
            ve.MONTH_CN = $scope.splitToMonth(ve.CREATE_DATE);
            ve.DAY_CN = $scope.splitToDay(ve.CREATE_DATE);

            for (var i = 0; i < $scope.agileAgreementTypes.length; i++) {
                if (ve.TRAINING_PROGRAM == $scope.agileAgreementTypes[i]) {
                    ve.COMPANY_COVER_RATE = '100%';
                    return "Agile";
                }
            }
            if (ve.COMPANY_COVER / ve.TOTAL_COST == 1) {
                ve.COMPANY_COVER_RATE = '100%';
                return "100Percent"
            } else if (ve.COMPANY_COVER / ve.TOTAL_COST == 0.5) {
                ve.COMPANY_COVER_RATE = '50%';
                return "50Percent";
            }
        };

        //Change to Chinese
        $scope.changeToCHN = function (Num) {
            Num = Num.toString();
            for (i = Num.length - 1; i >= 0; i--) {
                Num = Num.replace(",", "")
                Num = Num.replace(" ", "")
            }
            Num = Num.replace("￥", "")//Replace '￥' characters may appear
            if (isNaN(Num)) { //Verify if the input character as a number
                alert("Please check for proper courtesy amount.");
                return;
            }
            part = String(Num).split(".");
            newchar = "";
            //Preceding the Decimal conversion
            for (i = part[0].length - 1; i >= 0; i--) {
                if (part[0].length > 10) {
                    return "";
                }//If the number exceeds ten million units
                tmpnewchar = ""
                perchar = part[0].charAt(i);
                switch (perchar) {
                    case "0":
                        tmpnewchar = "零" + tmpnewchar;
                        break;
                    case "1":
                        tmpnewchar = "壹" + tmpnewchar;
                        break;
                    case "2":
                        tmpnewchar = "贰" + tmpnewchar;
                        break;
                    case "3":
                        tmpnewchar = "叁" + tmpnewchar;
                        break;
                    case "4":
                        tmpnewchar = "肆" + tmpnewchar;
                        break;
                    case "5":
                        tmpnewchar = "伍" + tmpnewchar;
                        break;
                    case "6":
                        tmpnewchar = "陆" + tmpnewchar;
                        break;
                    case "7":
                        tmpnewchar = "柒" + tmpnewchar;
                        break;
                    case "8":
                        tmpnewchar = "捌" + tmpnewchar;
                        break;
                    case "9":
                        tmpnewchar = "玖" + tmpnewchar;
                        break;
                }
                switch (part[0].length - i - 1) {
                    case 0:
                        tmpnewchar = tmpnewchar + "元";
                        break;
                    case 1:
                        if (perchar != 0) tmpnewchar = tmpnewchar + "拾";
                        break;
                    case 2:
                        if (perchar != 0) tmpnewchar = tmpnewchar + "佰";
                        break;
                    case 3:
                        if (perchar != 0) tmpnewchar = tmpnewchar + "仟";
                        break;
                    case 4:
                        tmpnewchar = tmpnewchar + "万";
                        break;
                    case 5:
                        if (perchar != 0) tmpnewchar = tmpnewchar + "拾";
                        break;
                    case 6:
                        if (perchar != 0) tmpnewchar = tmpnewchar + "佰";
                        break;
                    case 7:
                        if (perchar != 0) tmpnewchar = tmpnewchar + "仟";
                        break;
                    case 8:
                        tmpnewchar = tmpnewchar + "亿";
                        break;
                    case 9:
                        tmpnewchar = tmpnewchar + "拾";
                        break;
                }
                newchar = tmpnewchar + newchar;
            }
            //Transformation of digits after the decimal point
            if (Num.indexOf(".") != -1) {
                if (part[1].length > 2) {
                    alert("After the decimal point can only hold two, the system will automatically truncate.");
                    part[1] = part[1].substr(0, 2)
                }
                for (i = 0; i < part[1].length; i++) {
                    tmpnewchar = ""
                    perchar = part[1].charAt(i)
                    switch (perchar) {
                        case "0":
                            tmpnewchar = "零" + tmpnewchar;
                            break;
                        case "1":
                            tmpnewchar = "壹" + tmpnewchar;
                            break;
                        case "2":
                            tmpnewchar = "贰" + tmpnewchar;
                            break;
                        case "3":
                            tmpnewchar = "叁" + tmpnewchar;
                            break;
                        case "4":
                            tmpnewchar = "肆" + tmpnewchar;
                            break;
                        case "5":
                            tmpnewchar = "伍" + tmpnewchar;
                            break;
                        case "6":
                            tmpnewchar = "陆" + tmpnewchar;
                            break;
                        case "7":
                            tmpnewchar = "柒" + tmpnewchar;
                            break;
                        case "8":
                            tmpnewchar = "捌" + tmpnewchar;
                            break;
                        case "9":
                            tmpnewchar = "玖" + tmpnewchar;
                            break;
                    }
                    if (i == 0) tmpnewchar = tmpnewchar + "角";
                    if (i == 1) tmpnewchar = tmpnewchar + "分";
                    newchar = newchar + tmpnewchar;
                }
            }
            //Replace all unused characters
            while (newchar.search("零零") != -1)
                newchar = newchar.replace("零零", "零");
            newchar = newchar.replace("零亿", "亿");
            newchar = newchar.replace("亿万", "亿");
            newchar = newchar.replace("零万", "万");
            newchar = newchar.replace("零元", "元");
            newchar = newchar.replace("零角", "");
            newchar = newchar.replace("零分", "");
            if (newchar.charAt(newchar.length - 1) == "元" || newchar.charAt(newchar.length - 1) == "角")
                newchar = newchar + "整"
            return newchar;
        };

        //Split To Date
        $scope.splitToDate = function (date) {
            return date.split(" ")[0];
        };

        //Split To Year
        $scope.splitToYear = function (date) {
            return date.split("/")[0];
        };

        //Split To Month
        $scope.splitToMonth = function (date) {
            if (date !== '') {
                return date.split("/")[1];
            }
            return date;
        };

        //Split To Day
        $scope.splitToDay = function (date) {
            if (date !== '') {
                return date.split("/")[2].split(" ")[0];
            }
            return date;
        };

        $scope.cancelAgreement = function () {
            var index = $(this).index();
            $('#employeelistselecttab').children().removeClass('active');
            $('.employeelist').css('display', 'none');
            $('.employeelist').eq(0).css('display', 'block');
            $('#agreetab').css('display', 'none');
        };

        //change employee list tab
        $('#employeelistselecttab').children().click(function () {
            var index = $(this).index();
            $('#employeelistselecttab').children().removeClass('active');
            $(this).addClass('active');
            $('.employeelist').css('display', 'none');
            $('.employeelist').eq(index).css('display', 'block');
            $('#agreetab').css('display', 'none');
        });

        //print agreement
        $scope.preview = function (type) {
            var content = $('#agreeinfo' + type).html();
            document.body.innerHTML = content;
            window.print();
            window.location.reload();
        };

    }
]);

//Employee Add
employeeControllers.controller('EmployeeAddCtrl', ['$scope', '$filter', '$http', '$routeParams', '$timeout',
    function ($scope, $filter, $http, $routeParams, $timeout) {
        var application = {};
        $(document).ready(function () {
            $("#kv-explorer").fileinput({
                'uploadUrl': '/employeeAdd/save/' + encodeURIComponent(application) + '/save',
                overwriteInitial: false,
                initialPreviewAsData: true,
                uploadAsync: false,
                showUpload:true,
                dropZoneEnabled:false
            });
        });
        $('#kv-explorer').on('filebatchuploadsuccess', function (event, data, previewId, index) {
            var date = new Date();
            var createDate = date.getFullYear() + "/" + (date.getMonth() + 1) + "/" + date.getDate();
            $scope.application.CREATE_DATE = createDate;
            $scope.application.TRAINING_PERIOD_FROM = $("#trainingPeriodFrom").val();
            $scope.application.TRAINING_PERIOD_TO = $("#trainingPeriodTo").val();
            var application = $scope.toJSON();
            var fileNames = [];
            if(data.files){
                data.files.forEach(function (file) {
                    fileNames.push(file.name)
                })
            }
            $http(
                {
                    method: 'POST',
                    url: '/employeeAdd/save/renameFiles/' + encodeURIComponent(application),
                    data: {fileNames:fileNames}
                }
            ).success(function (data,status) {
                window.location.href = "/";
            });
        });
        //navigation
        $(".hoverTag").hover(
            function (e) {
                var message = e.currentTarget.firstElementChild.defaultValue;
                if (message == null || message == '' || message == undefined) {
                    $(".hoverdiv").css({
                        "display": "none",
                    });
                    $("#message").html("");
                } else {
                    $(".hoverdiv").css({
                        "display": "block",
                        "top": '200px',
                        "left": e.currentTarget.offsetLeft + e.currentTarget.offsetWidth / 2,
                    });
                    $(".hoverTag h4#" + e.currentTarget.lastElementChild.id).css({
                        "color": "blue",
                    });
                    $("#message").html(message);
                }
            },
            function () {
                $(".hoverdiv").css({
                    "display": "none",
                });
                $(".font-gray").css({
                    "color": "gray",
                });
                $(".font-black").css({
                    "color": "black",
                });
                $("#message").html("");
            }
        )

        //submit
        $scope.submit = function () {
            $scope.submitted = true;
            if ($scope.checkDisplay() === "block") {
                return;
            }
            if($('#kv-explorer').val()){
                $("#submitForm").trigger("click");
            }else{
                var date = new Date();
                var createDate = date.getFullYear() + "/" + (date.getMonth() + 1) + "/" + date.getDate();
                $scope.application.CREATE_DATE = createDate;
                $scope.application.TRAINING_PERIOD_FROM = $("#trainingPeriodFrom").val();
                $scope.application.TRAINING_PERIOD_TO = $("#trainingPeriodTo").val();
                var application = $scope.toJSON();
                $http({
                    method: 'POST',
                    url: '/employeeAdd/save/renameFiles/' + encodeURIComponent(application),
                    headers: {'Content-Type': 'application/x-www-form-urlencoded'}
                }).success(function (data, status) {
                    window.location.href = "/";
                });
            }
        };

        $('#addClass').attr('class', 'active');
        $('#allClass').removeAttr('class', 'active');
        $('#empClass').removeAttr('class', 'active');
        $('#approverClass').removeAttr('class', 'active');
        $('#shclKeyframes').shCircleLoader({
            keyframes: " 0%  {background:black}\
        40%  {background:transparent}\
        60%  {background:transparent}\
        100% {background:black}"
        });
        var heightOfWindow = $(document).height();
        var heightOfHeader = $("#headcon").height();
        $("body").height(heightOfWindow - 10);
        $("#containercon").height(heightOfWindow - 10 - heightOfHeader - 30);
        $('#trainingPeriodFrom').datetimepicker({
            format: 'Y/m/d',
            formatDate: 'Y/m/d',
            timepicker: false,
            onSelectDate: function () {
                $('#trainingPeriodFrom').trigger("change");
                $scope.application.TRAINING_PERIOD_FROM = $('#trainingPeriodFrom').val();
                checkTime($scope.application.TRAINING_PERIOD_FROM, $scope.application.TRAINING_PERIOD_TO);
                $scope.$apply();
            }
        });
        $scope.trainingToLimit = function(){
            $('#trainingPeriodTo').datetimepicker({
                format: 'Y/m/d',
                formatDate: 'Y/m/d',
                timepicker: false,
                minDate: $('#trainingPeriodFrom').val(),
                onSelectDate: function () {
                    $('#trainingPeriodTo').trigger("change");
                    $scope.application.TRAINING_PERIOD_TO = $('#trainingPeriodTo').val();
                    checkTime($scope.application.TRAINING_PERIOD_FROM, $scope.application.TRAINING_PERIOD_TO);
                },
            });
        }
        $("#EmployeeByAdd").height(heightOfWindow - 332);
        if ($("#EmployeeByAdd").height() < 530) {
            $("#EmployeeByAdd").height(530);
        }
        //GET ALL CERTIFICATION FROM TPT
        $http({
            method: 'JSONP',
            url: 'http://10.2.1.74:8080/tpt2013-portlet/resteasy/certification/all?callback=JSON_CALLBACK'
        }).success(function (response) {
            var allCerts = angular.fromJson(response);
            var programList = new Array();
            for (var i = 0; i < allCerts.length; i++) {
                var p = new Object();
                p.programName = allCerts[i].certificationName;
                programList.push(p);
            }
            $scope.allProgram = programList;
        }).error(function () {

        });

        $scope.role = "employee";
        $scope.warningMsg = "";
        $scope.submitted = false;
        $scope.isok = false;
        $scope.periodType = ["12 months", "6 months"];
        $scope.ccLast = "";
        $scope.allCC = [{"screenName": "CC1"}, {"screenName": "CC2"}];
        $scope.allProgram = [{"programName": "P1"}, {"programName": "P2"}, {"programName": "P3"}, {"programName": "P4"}, {"programName": "P5"}];
        $scope.application = {
            DATA_ID: "",
            EMP_NAME: getCookie('EMP_NAME'),
            EMP_ID: getCookie('EMP_ID'),
            CHINESE_NAME: "",
            IDENTIFICATION: "",
            APPROVER: "",
            CC: "",
            TRAINING_INSTITUTION: "",
            TRAINING_PROGRAM: "",
            TOTAL_COST: "",
            COMPANY_COVER: "",
            TRAINING_PERIOD_FROM: "",
            TRAINING_PERIOD_TO: "",
            SET_PERIOD: "",
            SERVICE_PERIOD_FROM: "",
            SERVICE_PERIOD_TO: "",
            REASON: "",
            CREATE_DATE: "",
            CREATE_BY: "",
            UPDATE_DATE: "",
            UPDATE_BY: "",
            STATUS: "submitted",
            REJECT_NOTES: "",
            COMPANY_COVER_RATE: "",
            TOTAL_COST_CN: "",
            COMPANY_COVER_CN: "",
            YEAR_CN: "",
            MONTH_CN: "",
            DAY_CN: "",
            REJECTED: "0",
            COMMENTS: "",
            COMMENTED: "0",
            certification: ""
        };

        function getCookie(c_name) {
            if (document.cookie.length > 0) {
                c_start = document.cookie.indexOf(c_name + "=")
                if (c_start != -1) {
                    c_start = c_start + c_name.length + 1
                    c_end = document.cookie.indexOf(";", c_start)
                    if (c_end == -1) c_end = document.cookie.length
                    return unescape(document.cookie.substring(c_start, c_end))
                }
            }
            return ""
        }

        $scope.checkChineseName = function (chineseName) {
            var ok = checkChineseName(chineseName);
            return ok;
        };

        $scope.checkOrganization = function (organization) {
            var ok = checkOrganization(organization);
            return ok;
        };

        $scope.checkProgram = function (program) {
            var ok = checkProgram(program);
            return ok;
        };

        $scope.checkIdNumber = function (identification) {
            var ok = checkIdNumber(identification);
            return ok;
        };

        $scope.checkTime = function (trainingPeriodFrom, trainingPeriodTo) {
            var ok = checkTime(trainingPeriodFrom, trainingPeriodTo);
            return ok;
        };

        $scope.checkAll = function (application) {
            var ok = checkAll(application);
            return ok;
        };

        $scope.checkDisplay = function () {
            $scope.warningMsg = "";
            var chineseNameCheck = $scope.checkChineseName($scope.application.CHINESE_NAME);
            if (chineseNameCheck !== "" && $scope.warningMsg === "")
                $scope.warningMsg = chineseNameCheck;
            var idNumberCheck = $scope.checkIdNumber($scope.application.IDENTIFICATION);
            if (idNumberCheck !== "" && $scope.warningMsg === "")
                $scope.warningMsg = idNumberCheck;
            var organizationCheck = $scope.checkOrganization($scope.application.TRAINING_INSTITUTION);
            if (organizationCheck !== "" && $scope.warningMsg === "")
                $scope.warningMsg = organizationCheck;
            var programCheck = $scope.checkProgram($scope.application.TRAINING_PROGRAM);
            if (programCheck !== "" && $scope.warningMsg === "")
                $scope.warningMsg = programCheck;
            var timeCheck = $scope.checkTime($scope.application.TRAINING_PERIOD_FROM, $scope.application.TRAINING_PERIOD_TO);
            if (timeCheck !== "" && $scope.warningMsg === "")
                $scope.warningMsg = timeCheck;
            if ($scope.submitted) {
                var allCheck = $scope.checkAll($scope.application);
                if (allCheck !== "") {
                    if ($scope.warningMsg === "")
                        $scope.warningMsg = allCheck;
                } else
                    $scope.submitted = false;
            }
            if ($scope.isok && $scope.warningMsg === "") {
                $('#trainingProgram').css("border-color", "red");
                $scope.warningMsg = "Your application of the training program already exists";
            }
            if ($scope.warningMsg === "")
                return "none";
            return "block";
        };

        $scope.change = function () {
            $('#trainingProgram').css("border-color", "");
            $scope.isok = false;
        };

        $scope.toJSON = function () {
            $scope.application.REASON = $scope.application.REASON.replace(/\\/g, 'exchangesprit');
            $scope.application.REASON = $scope.application.REASON.replace(/\//g, 'exchangeversprit');
            $scope.application.REASON = $scope.application.REASON.replace(/\n/g, 'exchangeenter');
            $scope.application.REASON = $scope.application.REASON.replace(/\r/g, 'exchanger');
            $scope.application.REASON = $scope.application.REASON.replace(/\"/g, 'exchangeyin');
            $scope.application.TRAINING_INSTITUTION = $scope.application.TRAINING_INSTITUTION.replace(/\"/g, 'exchangeyin');
            $scope.application.TRAINING_INSTITUTION = $scope.application.TRAINING_INSTITUTION.replace(/\\/g, 'exchangesprit');
            $scope.application.TRAINING_INSTITUTION = $scope.application.TRAINING_INSTITUTION.replace(/\//g, 'exchangeversprit');
            $scope.application.TRAINING_PROGRAM = $scope.application.TRAINING_PROGRAM.replace(/\"/g, 'exchangeyin');
            $scope.application.TRAINING_PROGRAM = $scope.application.TRAINING_PROGRAM.replace(/\\/g, 'exchangesprit');
            $scope.application.TRAINING_PROGRAM = $scope.application.TRAINING_PROGRAM.replace(/\//g, 'exchangeversprit');
            var application = $filter('json')($scope.application);
            return application;
        };

        $scope.reasonLeft = function () {
            return 500 - $scope.application.REASON.length;
        };

        $scope.setProgram = function (program) {
            $scope.application.TRAINING_PROGRAM = program;
        };

        $scope.checkFloat = function (ve) {
            IsFloat(ve);
        };

        $scope.checkAngelMoney = function (ve) {
            AngelMoney(ve);
        };

        $scope.focusProgram = function (ve) {
            if ($('#trainingProgram').is(":focus")) {
                return;
            }
            $('#trainingProgram').dropdown('toggle');
        };

    }
]);

//admin get allList
employeeControllers.controller('AllListCtrl', ["$scope", "$http", "$timeout", "$location",
    function ($scope, $http, $timeout, $location) {
        $('#allClass').attr('class', 'active');
        $('#empClass').removeAttr('class', 'active');
        $('#addClass').removeAttr('class', 'active');
        $('#approverClass').removeAttr('class', 'active');
        $scope.periodType = [
            {text: "", value: ""},
            {text: "6 months", value: "6"},
            {text: "12 months", value: "12"}
        ];

        $scope.focusProgram = function (emp_id) {
            $('#trainingProgram' + emp_id).dropdown('toggle');
        };

        // Export Excel
        $scope.exportExcel = function (reportData) {
            var exportType = $("ul.nav-tabs li.active a").html();
            var form = $("<form></form>");
            form.attr("style", "display:none");
            form.attr('action', '/api/exportExcel/export/' + exportType);
            form.attr('method', 'POST');
            form.attr('target', '_blank');
            var input = $("<input type='hidden' name='reportData'>");
            input.attr('value', JSON.stringify(reportData));

            form.append(input);
            $('body').append(form);
            form.submit();
        };


        // show edit agreement panel
        $scope.showEditAgreement = function (id, name, program, member) {
            var per50 = 0.5 * member.TOTAL_COST;
            var per100 = 1 * member.TOTAL_COST;
            var options = [];
            options.push("<option value='" + per50 + "'>" + "50%(" + per50 + ")</option>")
            options.push("<option value='" + per100 + "'>" + "100%(" + per100 + ")</option>")
            $("#companyCover" + id).append(options.join(''));
            $scope.records = [];
            if (member.SCANNING != null) {
                var pics = member.SCANNING.split(',');
                pics.forEach(function (pic) {
                    if (pic != '') {
                        $scope.records.push(pic);
                    }
                });
            }
            $scope.activeDateTimePicker(id, member);
            $("#editAgreementPanel" + id).dialog(
                {
                    height: 600,
                    width: 1200,
                    modal: true,
                    buttons: {
                        "Accept": function () {
                            if ($("#servicePeriodFrom" + id).val() == '' || $("#servicePeriodTo" + id).val() == '' || $("#companyCover" + id).val() == '' || $("#setperiod" + id).val() == '') {
                                $("#warningMsg" + id).empty();
                                $("#warningMsg" + id).append("Please fill all (*) fields");
                                $("#warningAlert" + id).css("display", "block");
                            } else {
                                $http({
                                    method: 'get',
                                    url: '/admin/updateStatus/' + id + '/accept',
                                    params: {
                                        "EMP_NAME": $("#EMP_NAME" + id).html(),
                                        "serviceFrom": $("#servicePeriodFrom" + id).val(),
                                        "serviceTo": $("#servicePeriodTo" + id).val(),
                                        "companyCover": $("#companyCover" + id).val(),
                                        'setPeriod': $("#setperiod" + id).val(),
                                        "comments": $("#comments" + id).val(),
                                        "CREATE_BY": $('#login_name').html()
                                    },
                                    headers: {'Content-Type': 'application/x-www-form-urlencoded'}
                                }).success(function (response) {
                                    window.location.reload();
                                });
                            }
                        },
                        "Reject": function () {
                            $http({
                                method: 'get',
                                url: '/admin/updateStatus/' + id + '/reject',
                                params: {
                                    "comments": $("#comments" + id).val(),
                                    "EMP_NAME": $("#EMP_NAME" + id).html(),
                                    "CREATE_BY": $('#login_name').html()
                                },
                                headers: {'Content-Type': 'application/x-www-form-urlencoded'}
                            }).success(function (response) {
                                window.location.reload();
                            });
                        },
                        "Cancel": function () {
                            $(this).dialog("destroy");
                        }
                    },
                    resizable: false,
                    open: function (event, ui) {
                        $(".ui-dialog-titlebar-close", $(this).parent()).hide();
                        $(".ui-dialog-buttonset>button").blur();
                        $(".ui-dialog-title").html(name + " - " + program);
                        $http({
                            method: 'post',
                            url: '/approve/getScannings/' + id,
                            headers: {'Content-Type': 'application/x-www-form-urlencoded'}
                        }).success(function (response) {
                            $scope.picFile = response;
                        });
                    }
                }
            );
        };

        //admin view the pdf
        $scope.viewFile = function (ve) {
            window.open("approve/viewScanning/viewFile?=" + ve.x);
        }

        //init the "service period from" input field to active date picker component
        $scope.activeDateTimePicker = function (_id, member) {
            $("#servicePeriodFrom" + _id).datetimepicker({
                format: 'Y/m/d',
                formatDate: 'Y/m/d',
                timepicker: false,
                onSelectDate: function () {
                    $("#servicePeriodFrom" + _id).trigger("change");
                    member.SERVICE_PERIOD_FROM = $("#servicePeriodFrom" + _id).val();
                    $scope.periodValidityChange(member);
                    $scope.$apply();
                }
            });
        };

        // init "period of validity" select value
        $scope.initSelectPeriod = function (trainingPeriodTo, servicePeriodTo) {
            var trainingTo = Date.parse(trainingPeriodTo) / 1000;
            var serviceTo = Date.parse(servicePeriodTo) / 1000;
            var interval = Math.floor((serviceTo - trainingTo) / (3600 * 24 * 30));
            return isNaN(interval) || (interval !== 6 && interval !== 12) ? '' : interval + '';
        };

        // After "period of validity" field changed
        $scope.periodValidityChange = function (member) {
            // if "Service Period" field is not filled
            if (member.SERVICE_PERIOD_FROM === "" || $("#setperiod" + member._id).val() === "") {
                return;
            }
            var interval = parseInt($("#setperiod" + member._id).val());
            var date = new Date($("#servicePeriodFrom" + member._id).val());
            date.setDate(date.getDate() - 1);
            var serviceStartMonth = date.getMonth() + 1;
            var serviceEndMonth = serviceStartMonth + interval;
            var carryover = serviceEndMonth > 12 ? Math.ceil(serviceEndMonth / 12 - 1) : 0;

            // process single digit
            serviceEndMonth = serviceEndMonth % 12 === 0 ? 12 : serviceEndMonth % 12;
            serviceEndMonth = serviceEndMonth < 10 ? "0" + serviceEndMonth : serviceEndMonth;

            var serviceEndTime = (date.getFullYear() + carryover) + "/" + serviceEndMonth +
                "/" + (date.getDate() < 10 ? "0" + date.getDate() : date.getDate());
            $("#servicePeriodTo" + member._id).val(serviceEndTime)
            /*$scope.AllApplications[_position].SERVICE_PERIOD_TO = serviceEndTime;*/
        };

        $scope.checkAgreement = function (ve) {
            $('#admin_sub').removeClass("active");
            $('#admin_inp').removeClass("active");
            $('#admin_act').removeClass("active");
            $('#admin_all').removeClass("active");
            $scope.agreement = ve;
            $('#employeelist').css("display", "none");
            $('#agreetab').css("display", "block");
            $('#agreetab').addClass('active');
            if ($scope.getAgreementType(ve) == '50Percent') {
                $('#agreement50').css("display", "block");
            } else if ($scope.getAgreementType(ve) == '100Percent') {
                $('#agreement100').css("display", "block");
            } else {
                $('#agreementAgile').css("display", "block");
            }
        };

        // Agile Agreement Types
        $scope.agileAgreementTypes = [
            'Certified Scrum Master (CSM)',
            'Certified Scrum Product Owner (CSPO)',
            'Certified Scrum Developer (CSD)',
            'Certified Scrum Trainer (CST)',
            'Certified Scrum Professional (CSP)'];

        // Get the agreement type to determine include which agreement template
        $scope.getAgreementType = function (ve) {
            ve.TOTAL_COST_CN = $scope.changeToCHN(ve.TOTAL_COST);
            ve.COMPANY_COVER_CN = $scope.changeToCHN(ve.COMPANY_COVER);
            ve.CREATE_DATE = $scope.splitToDate(ve.CREATE_DATE);
            ve.YEAR_CN = $scope.splitToYear(ve.CREATE_DATE);
            ve.MONTH_CN = $scope.splitToMonth(ve.CREATE_DATE);
            ve.DAY_CN = $scope.splitToDay(ve.CREATE_DATE);

            for (var i = 0; i < $scope.agileAgreementTypes.length; i++) {
                if (ve.TRAINING_PROGRAM == $scope.agileAgreementTypes[i]) {
                    ve.COMPANY_COVER_RATE = '100%';
                    return "Agile";
                }
            }
            if (ve.COMPANY_COVER / ve.TOTAL_COST == 1) {
                ve.COMPANY_COVER_RATE = '100%';
                return "100Percent"
            } else if (ve.COMPANY_COVER / ve.TOTAL_COST == 0.5) {
                ve.COMPANY_COVER_RATE = '50%';
                return "50Percent";
            }
        };

        //Change to Chinese
        $scope.changeToCHN = function (Num) {
            Num = Num.toString();
            for (i = Num.length - 1; i >= 0; i--) {
                Num = Num.replace(",", "")
                Num = Num.replace(" ", "")
            }
            Num = Num.replace("￥", "")//Replace '￥' characters may appear
            if (isNaN(Num)) { //Verify if the input character as a number
                alert("Please check for proper courtesy amount.");
                return;
            }
            part = String(Num).split(".");
            newchar = "";
            //Preceding the Decimal conversion
            for (i = part[0].length - 1; i >= 0; i--) {
                if (part[0].length > 10) {
                    return "";
                }//If the number exceeds ten million units
                tmpnewchar = ""
                perchar = part[0].charAt(i);
                switch (perchar) {
                    case "0":
                        tmpnewchar = "零" + tmpnewchar;
                        break;
                    case "1":
                        tmpnewchar = "壹" + tmpnewchar;
                        break;
                    case "2":
                        tmpnewchar = "贰" + tmpnewchar;
                        break;
                    case "3":
                        tmpnewchar = "叁" + tmpnewchar;
                        break;
                    case "4":
                        tmpnewchar = "肆" + tmpnewchar;
                        break;
                    case "5":
                        tmpnewchar = "伍" + tmpnewchar;
                        break;
                    case "6":
                        tmpnewchar = "陆" + tmpnewchar;
                        break;
                    case "7":
                        tmpnewchar = "柒" + tmpnewchar;
                        break;
                    case "8":
                        tmpnewchar = "捌" + tmpnewchar;
                        break;
                    case "9":
                        tmpnewchar = "玖" + tmpnewchar;
                        break;
                }
                switch (part[0].length - i - 1) {
                    case 0:
                        tmpnewchar = tmpnewchar + "元";
                        break;
                    case 1:
                        if (perchar != 0) tmpnewchar = tmpnewchar + "拾";
                        break;
                    case 2:
                        if (perchar != 0) tmpnewchar = tmpnewchar + "佰";
                        break;
                    case 3:
                        if (perchar != 0) tmpnewchar = tmpnewchar + "仟";
                        break;
                    case 4:
                        tmpnewchar = tmpnewchar + "万";
                        break;
                    case 5:
                        if (perchar != 0) tmpnewchar = tmpnewchar + "拾";
                        break;
                    case 6:
                        if (perchar != 0) tmpnewchar = tmpnewchar + "佰";
                        break;
                    case 7:
                        if (perchar != 0) tmpnewchar = tmpnewchar + "仟";
                        break;
                    case 8:
                        tmpnewchar = tmpnewchar + "亿";
                        break;
                    case 9:
                        tmpnewchar = tmpnewchar + "拾";
                        break;
                }
                newchar = tmpnewchar + newchar;
            }
            //Transformation of digits after the decimal point
            if (Num.indexOf(".") != -1) {
                if (part[1].length > 2) {
                    alert("After the decimal point can only hold two, the system will automatically truncate.");
                    part[1] = part[1].substr(0, 2)
                }
                for (i = 0; i < part[1].length; i++) {
                    tmpnewchar = ""
                    perchar = part[1].charAt(i)
                    switch (perchar) {
                        case "0":
                            tmpnewchar = "零" + tmpnewchar;
                            break;
                        case "1":
                            tmpnewchar = "壹" + tmpnewchar;
                            break;
                        case "2":
                            tmpnewchar = "贰" + tmpnewchar;
                            break;
                        case "3":
                            tmpnewchar = "叁" + tmpnewchar;
                            break;
                        case "4":
                            tmpnewchar = "肆" + tmpnewchar;
                            break;
                        case "5":
                            tmpnewchar = "伍" + tmpnewchar;
                            break;
                        case "6":
                            tmpnewchar = "陆" + tmpnewchar;
                            break;
                        case "7":
                            tmpnewchar = "柒" + tmpnewchar;
                            break;
                        case "8":
                            tmpnewchar = "捌" + tmpnewchar;
                            break;
                        case "9":
                            tmpnewchar = "玖" + tmpnewchar;
                            break;
                    }
                    if (i == 0) tmpnewchar = tmpnewchar + "角";
                    if (i == 1) tmpnewchar = tmpnewchar + "分";
                    newchar = newchar + tmpnewchar;
                }
            }
            //Replace all unused characters
            while (newchar.search("零零") != -1)
                newchar = newchar.replace("零零", "零");
            newchar = newchar.replace("零亿", "亿");
            newchar = newchar.replace("亿万", "亿");
            newchar = newchar.replace("零万", "万");
            newchar = newchar.replace("零元", "元");
            newchar = newchar.replace("零角", "");
            newchar = newchar.replace("零分", "");
            if (newchar.charAt(newchar.length - 1) == "元" || newchar.charAt(newchar.length - 1) == "角")
                newchar = newchar + "整"
            return newchar;
        };

        //Split To Date
        $scope.splitToDate = function (date) {
            return date.split(" ")[0];
        };

        //Split To Year
        $scope.splitToYear = function (date) {
            return date.split("/")[0];
        };

        //Split To Month
        $scope.splitToMonth = function (date) {
            return date.split("/")[1];
        };

        //Split To Day
        $scope.splitToDay = function (date) {
            return date.split("/")[2].split(" ")[0];
        };

        $scope.cancelAgreement = function () {
            var index = $(this).index();
            $('#employeelistselecttab').children().removeClass('active');
            $('.employeelist').css('display', 'none');
            $('.employeelist').eq(0).css('display', 'block');
            $('#agreetab').css('display', 'none');
        };

        //print agreement
        $scope.preview = function (type) {
            var content = $('#agreeinfo' + type).html();
            document.body.innerHTML = content;
            window.print();
            window.location.reload();
        };

        //Pass Id
        $scope.passID = function (id) {
            $('#storeID').val(id);
        };

        //Finish Item
        $scope.finishItem = function () {
            var id = $('#storeID').val();
            $http({
                method: 'get',
                url: '/admin/updateStatus/' + id + '/finish',
                headers: {'Content-Type': 'application/x-www-form-urlencoded'}
            }).success(function (response) {
                $('#finish_btn_' + id).css('display', 'none');
                window.location.reload();
            });
        };

        //Calculate the refund of an employee
        $scope.calculate = function (member) {
            $scope.activeCalDateTimePicker(member._id, member.COMPANY_COVER);
            $("#calculatePanel" + member._id).dialog(
                {
                    height: 600,
                    width: 650,
                    modal: true,
                    buttons: {
                        "Send": function () {
                            if ($('#separationDate_' + member._id).val() != "" && $('#refundFee_' + member._id).val() != "") {
                                $http({
                                    method: 'get',
                                    url: '/admin/sendEmail/refundFee',
                                    params: {
                                        "service_from": $('#servicePeriodFrom_cal_' + member._id).val(),
                                        "service_to": $('#servicePeriodTo_cal_' + member._id).val(),
                                        "separationDate": $('#separationDate_' + member._id).val(),
                                        "companyCover": $('#companyCover_' + member._id).val(),
                                        "refundFee": $('#refundFee_' + member._id).val(),
                                        "EMP_NAME": member.EMP_NAME,
                                        "TRAINING_PROGRAM": member.TRAINING_PROGRAM
                                    },
                                    headers: {'Content-Type': 'application/x-www-form-urlencoded'}
                                }).success(function (response) {
                                    window.location.reload();
                                });
                            } else {
                                if ($('#separationDate_' + member._id).val() == "") {
                                    $('#separationDate_' + member._id).css("border-color", "red");
                                }
                                if ($('#refundFee_' + member._id).val() == "") {
                                    $('#refundFee_' + member._id).css("border-color", "red");
                                }
                            }
                        },
                        "Cancel": function () {
                            $(this).dialog("destroy");
                        }
                    },
                    resizable: false,
                    open: function (event, ui) {
                        $(".ui-dialog-titlebar-close", $(this).parent()).hide();
                    }

                }
            );
        }

        //init the "separationDate" input field to active date picker component
        $scope.activeCalDateTimePicker = function (_id, companyCover) {
            $("#separationDate_" + _id).datetimepicker({
                format: 'Y/m/d',
                formatDate: 'Y/m/d',
                timepicker: false,
                minDate: $("#servicePeriodFrom_cal_" + _id).val(),
                maxDate: $("#servicePeriodTo_cal_" + _id).val(),
                onSelectDate: function () {
                    $("#separationDate_" + _id).trigger("change");
                    $scope.getRefundFee($("#servicePeriodFrom_cal_" + _id).val(), $("#servicePeriodTo_cal_" + _id).val(), $("#separationDate_" + _id).val(), _id, companyCover);
                    $('#separationDate_' + _id).css("border-color", "");
                    $('#refundFee_' + _id).css("border-color", "");
                    $scope.$apply();
                }
            });
        };


        // After "separationDate" field changed
        $scope.getRefundFee = function (servicePeriodFrom, servicePeriodTo, separationDate, _id, companyCover) {
            var serviceInterval = $scope.DateDiff(servicePeriodFrom, servicePeriodTo);
            var separationInterval = $scope.DateDiff(separationDate, servicePeriodTo);

            $('#refundFee_' + _id).val(((separationInterval / serviceInterval) * parseInt(companyCover)).toFixed(2));
        };

        //Calculate date interval
        $scope.DateDiff = function (sDate1, sDate2) {
            var aDate, oDate1, oDate2, iDays, remainder, divisor, weekendDay, nextDay;

            aDate = sDate1.split("/");

            oDate1 = new Date(aDate[1] + '-' + aDate[2] + '-' + aDate[0]);

            aDate = sDate2.split("/");

            oDate2 = new Date(aDate[1] + '-' + aDate[2] + '-' + aDate[0]);

            iDays = parseInt(Math.abs(oDate1 - oDate2) / 1000 / 60 / 60 / 24) + 1;
            remainder = iDays % 7;
            divisor = Math.floor(iDays / 7);
            weekendDay = 2 * divisor;
            nextDay = oDate1.getDay();
            for (var tempDay = remainder; tempDay >= 1; tempDay--) {
                if (tempDay == remainder) {
                    nextDay = nextDay + 0;
                } else if (tempDay != remainder) {
                    nextDay = nextDay + 1;
                }
                if (nextDay == 7) {
                    nextDay = 0;
                }

                if (nextDay == 0 || nextDay == 6) {
                    weekendDay = weekendDay + 1;
                }
            }

            iDays = iDays - weekendDay;
            console.log("get days:" + iDays);
            return iDays;
        }

    }
]);
//approver list
employeeControllers.controller("ApproverListCtrl", ["$scope", "$http", "$timeout", "$location",
    function ($scope, $http, $timeout) {

    }
]);

employeeControllers.controller('SystemConfigCtrl', ['$scope', '$http',
    function ($scope, $http) {
        //get roles list
        $http({
            url: '/admin/getconfiglist',
            headers: {'Content-Type': 'application/x-www-form-urlencoded'}
        }).success(function (response) {
            $scope.adminlist = response.adminListJson;
            $scope.adminlist.forEach(function (admin) {
                admin.readonly = true;
            });
            $scope.approverlist = response.approverListJson;
            $scope.approverlist.forEach(function (approver) {
                approver.readonly = true;
            });
            $scope.accountantlist = response.accountantlistJson;
            $scope.accountantlist.forEach(function (accountant) {
                accountant.readonly = true;
            });
            $scope.emailgrouptlist = response.emailgrouptlist;
            $scope.emailgrouptlist.forEach(function (emailgroup) {
                emailgroup.readonly = true;
            });
        }).error(function () {
            console.log('get configlist failed')
        });
        $scope.$on("removeAdmin", function (event, data) {
            $scope.adminlist.splice(data, 1);
        });
        $scope.$on("removeApprover", function (event, data) {
            $scope.approverlist.splice(data, 1);
        });
        $scope.$on("removeAccountant", function (event, data) {
            $scope.accountantlist.splice(data, 1);
        });
        $scope.$on("removeEmailGroup", function (event, data) {
            $scope.emailgrouptlist.splice(data, 1);
        });
        $scope.save = function () {
            var contain = false;
            $scope.adminlist.forEach(function (admin) {
                $scope.approverlist.forEach(function (approver) {
                    if (admin.name === approver.name) {
                        contain = true;
                    }
                })
            })
            if (contain) {
                alert('Already exist')
                return;
            }
            if ($scope.adminlist.length < 1 || $scope.adminlist[$scope.adminlist.length - 1].name === undefined || $scope.adminlist[$scope.adminlist.length - 1].name === '') {
                return;
            }
            if ($scope.approverlist.length < 1 || $scope.approverlist[$scope.approverlist.length - 1].name === undefined || $scope.approverlist[$scope.approverlist.length - 1].name === '') {
                return;
            }
            if ($scope.accountantlist.length < 1 || $scope.accountantlist[$scope.accountantlist.length - 1].name === undefined || $scope.accountantlist[$scope.accountantlist.length - 1].name === '') {
                return;
            }
            else {
                var data = {
                    adminlist: $scope.adminlist,
                    approverlist: $scope.approverlist,
                    accountantlist: $scope.accountantlist,
                    emailgrouptlist: $scope.emailgrouptlist
                };
                $http({
                    method: 'POST',
                    url: '/admin/updateSystemConfig',
                    params: data,
                    headers: {'Content-Type': 'application/x-www-form-urlencoded'}
                }).success(function (response) {
                    window.location.href = "/";
                });
            }
        }
    }
]);
employeeControllers.controller('MyController', ['$scope', '$http',
    function ($scope, $http) {
        $("#filter_th_sta").datetimepicker({
            format: 'Y/m/d',
            formatDate: 'Y/m/d',
            timepicker: false,
            onSelectDate: function () {
                $scope.th_sta = $("#filter_th_sta").val();
                $scope.filter();
            }
        });
        $("#filter_th_end").datetimepicker({
            format: 'Y/m/d',
            formatDate: 'Y/m/d',
            timepicker: false,
            onSelectDate: function () {
                $scope.th_end = $("#filter_th_end").val();
                $scope.filter();
            }
        });

        $scope.clear = function () {
            $scope.q = '';
        }
        //Get URL Param
        $scope.getUrlParam = function (name) {
            var after = window.location.hash.split("?")[1];
            if (after) {
                var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)");
                var r = after.match(reg);
                if (r != null) {
                    return decodeURIComponent(r[2]);
                } else {
                    return null;
                }
            }
        };
        var path = String(location).split('#/')[1].split('?')[0];
        if (path === 'employeelist') {
            var login_name = $('#login_name').text();
            $scope.currentPage = 1;
            $scope.pageSize = 10;
            $scope.meals = [];
            //GET Employee info FROM TPT
            $http({
                method: 'JSONP',
                url: 'http://10.2.1.74:8080/tpt2013-portlet/resteasy/employees?callback=JSON_CALLBACK'
            }).success(function (response) {
                var EmpInfo = angular.fromJson(response);
                for (var i = 0; i < EmpInfo.length; i++) {
                    if (EmpInfo[i].screenName === login_name) {
                        $scope.empid = EmpInfo[i].emid;
                        $scope.empname = EmpInfo[i].screenName;
                        //init employee's index page lists
                        $http({
                            method: 'POST',
                            url: '/getFirstPage/first' + '/' + $scope.empid,//Analog data
                            headers: {'Content-Type': 'application/x-www-form-urlencoded'}
                        }).success(function (response) {
                            $scope.meals = response;
                            $scope.filterResults = $scope.meals;
                        }).error(function () {
                            console.log('fecth failed');
                        });
                    }
                }
            });
            $scope.filter = function () {
                var filterByComCover = $scope.filterByCompCover();
                var filterByThSta = $scope.filterByThSta();
                var filterByThEnd = $scope.filterByThEnd();
                var results = [];
                var results_2 = [];
                if(filterByComCover){
                    for(var i = 0; i < filterByComCover.length; i++ ){
                        if(filterByThSta){
                            for(var j = 0; j < filterByThSta.length; j++ ){
                                if(filterByComCover[i]._id === filterByThSta[j]._id){
                                    results.push(filterByThSta[j]);
                                }
                            }
                        }
                    }
                }
                if(filterByThEnd){
                    for(var i = 0; i < filterByThEnd.length; i++){
                        if(results || results.length > 0){
                            for(var j = 0; j < results.length; j++ ){
                                if(filterByThEnd[i]._id === results[j]._id){
                                    results_2.push(results[j]);
                                }
                            }
                        }
                    }
                }
                $scope.filterResults = results_2;
            }
            $scope.filterByCompCover = function () {
                var results = [];
                if(!$scope.com_cover){
                    results = $scope.meals;
                }
                if($scope.com_cover && $scope.meals){
                    $scope.meals.forEach(function(meal){
                        var com_cover = meal.COMPANY_COVER;
                        if(com_cover && com_cover != null && com_cover.toString().indexOf($scope.com_cover) >= 0){
                            results.push(meal);
                        }
                    });
                }
                return results;
            }
            $scope.filterByThSta = function () {
                var results = [];
                if(!$scope.th_sta){
                    results = $scope.meals;
                }
                if($scope.th_sta && $scope.meals){
                    $scope.meals.forEach(function(meal){
                        var th_sta = meal.SERVICE_PERIOD_FROM;
                        if(th_sta && th_sta != null && parseInt(th_sta.replace(/\//g,'')) >= parseInt($scope.th_sta.replace(/\//g,''))){
                            results.push(meal);
                        }
                    });
                }
                return results;
            }
            $scope.filterByThEnd = function () {
                var results = [];
                if(!$scope.th_end){
                    results = $scope.meals;
                }
                if($scope.th_end && $scope.meals){
                    $scope.meals.forEach(function(meal){
                        var th_end = meal.SERVICE_PERIOD_TO;
                        if(th_end && th_end != null && parseInt(th_end.replace(/\//g,'')) <= parseInt($scope.th_end.replace(/\//g,''))){
                            results.push(meal);
                        }
                    });
                }
                return results;
            }
        }
        if (path === 'approverlist') {
            $scope.currentPage = 1;
            $scope.pageSize = 10;
            $scope.meals = [];
            //init approver's index lists
            $http({
                method: 'post',
                url: '/approve/getFirstPage/first?status=Pending',
                headers: {'Content-Type': 'application/x-www-form-urlencoded'}
            }).success(function (response) {
                $scope.meals = response;
            }).error(function () {
                console.log('fecth failed');
            });

            $('#empClass').removeAttr('class', 'active');
            $('#allClass').removeAttr('class', 'active');
            $('#addClass').removeAttr('class', 'active');
            $('#approverClass').attr('class', 'active');
            $('#emplisttab_pending').attr('class', 'active');
            $('#emplisttab_approved').removeAttr('class', 'active');

            var param_rec_id_str = "rec_id";
            var param_rec_id = $scope.getUrlParam(param_rec_id_str);
            if(param_rec_id != null){
                $http({
                    method: 'post',
                    url: 'record/'+ param_rec_id +'/getApplication',
                    headers: {'Content-Type': 'application/x-www-form-urlencoded'}
                }).success(function (response) {
                    $scope.showEditAgreement(param_rec_id, response.EMP_NAME, response.TRAINING_PROGRAM, response);
                }).error(function () {
                    console.log('fecth failed');
                });
            }

            // approver view agreement panel
            $scope.showEditAgreement = function (id, name, program, status) {
                if (status === 'Approved') {
                    $("#editAgreementPanel" + id).dialog(
                        {
                            height: 700,
                            width: 1200,
                            modal: true,
                            buttons: {
                                "Cancel": function () {
                                    $(this).dialog("destroy");
                                }
                            },
                            resizable: false,
                            open: function (event, ui) {
                                $(".ui-dialog-titlebar-close", $(this).parent()).hide();
                                $(this).css('overflow',hidden);
                                $("textarea").blur();
                                $http({
                                    method: 'post',
                                    url: '/approve/getScannings/' + id,
                                    headers: {'Content-Type': 'application/x-www-form-urlencoded'}
                                }).success(function (response) {
                                    $scope.picFile = response;
                                });
                            }
                        }
                    );
                } else {
                    $("#editAgreementPanel" + id).dialog(
                        {
                            height: 700,
                            width: 1200,
                            modal: true,
                            buttons: {
                                "Approve": function () {
                                    $http({
                                        method: 'post',
                                        url: '/approve/' + id + '/approved',
                                        headers: {'Content-Type': 'application/x-www-form-urlencoded'},
                                        params: {
                                            "EMP_NAME": $("#EMP_NAME" + id).html(),
                                            "COMMENTS": $("#text" + id).val(),
                                            "CREATE_BY": $('#login_name').html()
                                        }
                                    }).success(function (response) {
                                        window.location.reload();
                                        console.log('approve success');
                                    });
                                    $(this).dialog("destroy");
                                },
                                "Disapprove": function () {
                                    $http({
                                        method: 'post',
                                        url: '/approve/' + id + '/reject',
                                        headers: {'Content-Type': 'application/x-www-form-urlencoded'},
                                        params: {
                                            "EMP_NAME": $("#EMP_NAME" + id).html(),
                                            "COMMENTS": $("#text" + id).val(),
                                            "CREATE_BY": $('#login_name').html()
                                        }
                                    }).success(function (response) {
                                        window.location.reload();
                                    });
                                    $(this).dialog("destroy");
                                },
                                "Cancel": function () {
                                    $(this).dialog("destroy");
                                }
                            },
                            resizable: false,
                            open: function (event, ui) {
                                $(".ui-dialog-titlebar-close", $(this).parent()).hide();
                                /*$(this).css('overflow','hidden');*/
                                $("textarea").blur();
                                $http({
                                    method: 'post',
                                    url: '/approve/getScannings/' + id,
                                    headers: {'Content-Type': 'application/x-www-form-urlencoded'}
                                }).success(function (response) {
                                    $scope.picFile = response;
                                });
                            }
                        }
                    );
                }
            };
            //approver view the pdf
            $scope.viewFile = function (ve) {
                window.open("approve/viewScanning/viewFile?=" + ve.file);
            }
            //click 'Pending' href
            $scope.approverPending = function () {
                $('#emplisttab_pending').attr('class', 'active');
                $('#emplisttab_approved').removeAttr('class', 'active');
                $http({
                    method: 'post',
                    url: '/approve/getFirstPage/first?status=Pending',
                    headers: {'Content-Type': 'application/x-www-form-urlencoded'}
                }).success(function (response) {
                    $scope.meals = response;
                }).error(function () {
                    console.log('fecth failed');
                });
            }
            //click 'Approved' href
            $scope.approverApproved = function () {
                $('#emplisttab_pending').removeAttr('class', 'active');
                $('#emplisttab_approved').attr('class', 'active');
                $http({
                    method: 'post',
                    url: '/approve/getFirstPage/first?status=Approved',
                    headers: {'Content-Type': 'application/x-www-form-urlencoded'}
                }).success(function (response) {
                    $scope.meals = response;
                }).error(function () {
                    console.log('fecth failed');
                });
            }
        }
        if (path === 'alllist') {

            $('#admin_sub').attr('class', 'active');
            $('#admin_inp').removeAttr('class', 'active');
            $('#admin_act').removeAttr('class', 'active');
            $('#admin_all').removeAttr('class', 'active');
            $scope.currentPage = 1;
            $scope.pageSize = 10;
            $scope.meals = [];
            $http({
                method: 'post',
                url: 'list/getFirstPage?status=Submitted',
                headers: {'Content-Type': 'application/x-www-form-urlencoded'}
            }).success(function (response) {
                $scope.meals = response;
                $scope.filterResults = $scope.meals;
            }).error(function () {
                console.log('fecth failed');
            });

            var param_rec_id_str = "rec_id";
            var param_rec_id = $scope.getUrlParam(param_rec_id_str);
            if (param_rec_id != null) {
                $http({
                    method: 'post',
                    url: 'record/' + param_rec_id + '/getApplication',
                    headers: {'Content-Type': 'application/x-www-form-urlencoded'}
                }).success(function (response) {
                    $scope.showEditAgreement(param_rec_id, response.EMP_NAME, response.TRAINING_PROGRAM, response);
                }).error(function () {
                    console.log('fecth failed');
                });
            }
            //click submitted tab
            $scope.adminsub = function () {
                $('#admin_sub').attr('class', 'active');
                $('#admin_inp').removeAttr('class', 'active');
                $('#admin_act').removeAttr('class', 'active');
                $('#admin_all').removeAttr('class', 'active');
                $('#agreetab').removeAttr('class', 'active');
                $('#agreetab').css("display", "none");
                $('.employeelist').css("display", "none");
                $('#employeelist').css("display", "block");
                $http({
                    method: 'post',
                    url: 'list/getFirstPage?status=Submitted',
                    headers: {'Content-Type': 'application/x-www-form-urlencoded'}
                }).success(function (response) {
                    $scope.filterResults = response;
                }).error(function () {
                    console.log('fecth failed');
                });
            }
            //click in progress tab
            $scope.admininp = function () {
                $('#admin_sub').removeAttr('class', 'active');
                $('#admin_inp').attr('class', 'active');
                $('#admin_act').removeAttr('class', 'active');
                $('#admin_all').removeAttr('class', 'active');
                $('#agreetab').removeAttr('class', 'active');
                $('#agreetab').css("display", "none");
                $('.employeelist').css("display", "none");
                $('#employeelist').css("display", "block");
                $http({
                    method: 'post',
                    url: 'list/getFirstPage?status=InProgress',
                    headers: {'Content-Type': 'application/x-www-form-urlencoded'}
                }).success(function (response) {
                    $scope.filterResults = response;
                }).error(function () {
                    console.log('fecth failed');
                });
            }
            //click active tab
            $scope.adminact = function () {
                $('#admin_sub').removeAttr('class', 'active');
                $('#admin_inp').removeAttr('class', 'active');
                $('#admin_act').attr('class', 'active');
                $('#admin_all').removeAttr('class', 'active');
                $('#agreetab').removeAttr('class', 'active');
                $('#agreetab').css("display", "none");
                $('.employeelist').css("display", "none");
                $('#employeelist').css("display", "block");
                $http({
                    method: 'post',
                    url: 'list/getFirstPage?status=Active',
                    headers: {'Content-Type': 'application/x-www-form-urlencoded'}
                }).success(function (response) {
                    $scope.filterResults = response;
                }).error(function () {
                    console.log('fecth failed');
                });
            }
            //click all tab
            $scope.adminall = function () {
                $('#admin_sub').removeAttr('class', 'active');
                $('#admin_inp').removeAttr('class', 'active');
                $('#admin_act').removeAttr('class', 'active');
                $('#admin_all').attr('class', 'active');
                $('#agreetab').removeAttr('class', 'active');
                $('#agreetab').css("display", "none");
                $('.employeelist').css("display", "none");
                $('#employeelist').css("display", "block");
                $http({
                    method: 'post',
                    url: 'list/getFirstPage?status=All',
                    headers: {'Content-Type': 'application/x-www-form-urlencoded'}
                }).success(function (response) {
                    $scope.filterResults = response;
                }).error(function () {
                    console.log('fecth failed');
                });
            }

            $scope.commentCharactersLeft = function (ve) {
                return 500 - $('#comments' + ve).val().length;
            }
        }
    }
]);