var formatDate = function (date) {
    var year = date.getFullYear();
    var month = date.getMonth() + 1;
    var day = date.getDate();
    var hour = date.getHours();
    var minute = date.getMinutes();
    var second = date.getSeconds();

    return currentDate = year + '/' + month + '/' + day + ' ' + hour + ':' + minute + ':' + second;
}

exports.formatDate = formatDate;