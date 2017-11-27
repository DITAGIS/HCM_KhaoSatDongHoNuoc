define([

], function () {
    'use strict';
    return class {
        constructor(date) {
            this.date = date;
        }
        checkOutOfDate(date) {
            var today = new Date();
            return (today.getTime() - date) > 0 ? false : true;
        }
        checkUnexpired(date) {
            return !this.checkOutOfDate(date);
        }
        static formatDateValue(arg) {
            if (!arg) return '';
            var date = new Date(arg);
            let day = date.getDate(),
                month = date.getMonth() + 1,
                year = date.getFullYear();
            if (day / 10 < 1)
                day = '0' + day;
            if (month / 10 < 1)
                month = '0' + month;
            let value = `${year}-${month}-${day}`;
            return value;
        }
        static formatNumberDate(number) {
            if (!number) return '';
            var date = new Date(number);
            let day = date.getDate(),
                month = date.getMonth() + 1,
                year = date.getFullYear();
            if (day / 10 < 1)
                day = '0' + day;
            if (month / 10 < 1)
                month = '0' + month;

            return `${day}/${month}/${year}`;
        }
    }

});