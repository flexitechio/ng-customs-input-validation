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
