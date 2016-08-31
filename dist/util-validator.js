/*! UtilValidate v1.0.0 | https://npmcdn.com/utilvalidate@1.0.0/LICENSE.txt */
var UtilValidateExports = {};
(function(exports) {
    String.prototype.trim = function() {
    return this.replace(/^\s+|\s+$/g, '');
};

String.prototype.ltrim = function() {
    return this.replace(/^\s+/, '');
};

String.prototype.rtrim = function() {
    return this.replace(/\s+$/, '');
};

String.prototype.fulltrim = function() {
    return this.replace(/(?:(?:^|\n)\s+|\s+(?:$|\n))/g, '').replace(/\s+/g, ' ');
};
function checkNumber(evt) {
    var charCode = (evt.which) ? evt.which : event.keyCode
    if (charCode > 31 && (charCode < 48 || charCode > 57) && (charCode < 96 || (charCode > 105 && charCode != 110)))
        return false;
    return true;
}
function checkPhone(evt) {
    var charCode = (evt.which) ? evt.which : event.keyCode
    if (charCode == 150 || charCode > 31 && (charCode < 48 || charCode > 57))
        return false;
    return true;
}
function formatPhone(phone, doFormat) {
    if (doFormat) {
        phone = phone.replace(/[^0-9]/g, '');
        phone = phone.replace(/(\d{3})(\d{3})(\d{3})/, "($1) $2-$3");
        return phone;
    } else {
        return phone.replace(/[^0-9]/g, '');
    }
}
function generate(len) {
    var text = '';
    var possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    for (var i = 0; i < len; i++){
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
}
function isDate(date) {
    return moment(date).isValid();
}
function isEmail(email) {
    var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(email);
}
// Return true means ok, false mean error
// Internal classes
function utilValidateEngine(value) {
    this.value = value;

    this.setEngineBaseValue = function(value) {
        this.value = value;
    };
    this.handleRequired = function() {
        var that = this;
        return !(!that.value ||
            that.value == null ||
            that.value == '' ||
            (that.value + "").trim().length <= 0);
    };
    this.handleNumeric = function(min) {
        var that = this;
        if (!that.value){
            return true;
        }
        var n = +that.value;
        if (min && _.isNumber(+min)){
            return (_.isNumber(n) && !_.isNaN(n)) && n >= +min;
        }
        else{
            return (_.isNumber(n) && !_.isNaN(n));
        }
    };
    this.handleEmail = function() {
        var that = this;
        return isEmail(that.value);
    };
    this.handlePhonenumber = function() {
        var that = this;
        var phone = that.value || '';
        phone = (phone + "").replace(/[^0-9]/g, '');
        var n = +phone;

        return (phone.trim().length >= 9 && _.isNumber(n) && !_.isNaN(n));
    }
    this.handleDate = function(format) {
        var that = this;
        return moment(this.value, format).isValid();
    };
    this.handleDateRange = function(format, minValueList, maxValueList) {

        var that = this;
        var withinMinValueList = true;
        var withinMaxValueList = true;

        // If the min list is defined, do check it
        // Else, maybe someone does not want to limit the min value
        if (_.isArray(minValueList) && !_.isUndefined(minValueList)) {
            var parsedTimeStamp;
            var tmp = moment(that.value || '', format);
            _.each(minValueList, function(v, k) {
                if (v) {
                    parsedTimeStamp = moment(v, format);
                    if (tmp.isBefore(parsedTimeStamp)) {
                        withinMinValueList = withinMinValueList && false;
                    }
                } else {
                    withinMinValueList = withinMinValueList && true;
                }
            });
        }

        if (_.isArray(maxValueList) && !_.isUndefined(maxValueList)) {
            var parsedTimeStamp;
            var tmp = moment(that.value || '', format);
            _.each(maxValueList, function(v, k) {
                if (v) {
                    parsedTimeStamp = moment(v, format);
                    if (tmp.isAfter(parsedTimeStamp)) {
                        withinMaxValueList = withinMaxValueList && false;
                    }
                } else {
                    withinMaxValueList = withinMaxValueList && true;
                }
            });

        }
        return {
            "min": withinMinValueList,
            "max": withinMaxValueList
        };

    };
    this.handlePair = function(secondOperator, caseInsensitive) {
        var that = this;
        if (caseInsensitive) {
            return that.value.toUpperCase() == secondOperator.toUpperCase();
        } else {
            return that.value == secondOperator;
        }
    };
    this.handleRegExp = function(exp) {
        var that = this;
        return exp.test(that.value);
    };
}

var module = angular.module('util-flexitech.validate', []);

/**
 * /src/services/validate.js
 *
 * Service to contain all validation methods
 * 
 */

module.service('utilValidate', ['$filter',
    function($filter) {

    	/**
    	 * Initialize required method to use
    	 */
	    var method = {
	        makeid: generate,
	        isNumberKey: checkNumber,
	        isPhoneKey: checkPhone,
	        isDate: isDate,
	        formatPhonenumber: formatPhone,
	        isEmail: isEmail
	    };

	    /**
    	 * Initialize validation engine
    	 */
	    method.engine = new utilValidateEngine();
	    method.getEngine = function(value) {
	        return new utilValidateEngine(value);
	    };

    	return method;
    }
]);
	module.version = '1.0.0';
	exports.UtilValidate = module;
})(UtilValidateExports);

(function (global, factory) {
  if (typeof exports === 'object' && typeof module !== 'undefined') {
    module.exports = factory;
  } else if (typeof define === 'function' && define.amd) {
    define(factory);
  } else {
    global.UtilValidate = factory;
  }
}(this, UtilValidateExports.UtilValidate));