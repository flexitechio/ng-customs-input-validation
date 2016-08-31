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
/**
 * /src/directives/validate.js
 *
 * Directive for validating based on form input element and ngModel
 * Contain attribute required for configuration
 * Isolate scope declaration {config} as (string) - should have a attribute such as
 *     config : {
 *          // REQUIRED
 *          "type" : "required|numeric|email|phone-number|pair|date|pair-date|complex-password|numeric|reg-exp", OR
 *          "types" : ["Array of type can handle different type"],
 *          "group-name" : "one can have many validation group", OR
 *          "group-names" : "one control can be in many group",
 *          "custom-error-class" : "class name",
 *          "custom-error-message" : "message",
 *          "on" : "validation on focus|blur|keypress|keyup|keypressed|change|custom", (custom event required u defined the config as a configObject instead of string config)
 *          // OPTIONAL or REQUIRED by TYPE
 *          "date-format" : "mm-dd-yyyy", (date,pair-date)
 *          "id"  : "unique id of current control", (pair, pair-date)
 *          "pair-id" : "id of other control to check pair with" , (pair, pair-date),
 *          "pair-type" : "start|end id of other control to check pair with" , (pair, pair-date),
 *          "min-value" : "the number or date or timestamp of min value", (date, numeric, pair-date),
 *          "max-value" : "the number or date or timestap of max value" , (date, numeric, pair-date),
 *          "reg-exp" : "the regular express used to validate",
 *          "broadcast-event" : " defined event name that the scope can be listened that when error occur this directive will broadcast" ,
 *          "serialize" : "serialize or format to",
 *          "realtime" : "true|false" (turn validate/format in realtime on or off such as phone, date, numeric),
 *          "disable" : "true|false",
 *          "allow-focus": "true|false",
 *			"selectize": "true|false",
 *			"select2": 	"true|false",
 *			"modal-scroll": "modal ID that input are on",
 *          "index": "seq"
 *     }
 * 
 */

module.directive('utilValidate', ['utilValidate', '$timeout',
    function(validator, $timeout) {
        return {
            restrict: 'A',
            require: '?ngModel',
            
            controller: ['$scope', '$location', '$rootScope', '$timeout', function($scope, $location, $rootScope, $timeout) {

                if (_.isUndefined($rootScope.predefinedListOfControl)) {
                    $rootScope.predefinedListOfControl = [];
                }

                /**
                 * Reset form control
                 */
                $rootScope.resetControls = function(withRemove) {

                    if (!withRemove) {
                        _.each($rootScope.predefinedListOfControl, function(v, k) {
                            v.dirty = false;
                            v.reset();
                        });

                    } else {
                        $rootScope.predefinedListOfControl = [];
                    }

                };

                /**
                 * Manual function to validate
                 */

                $rootScope.resetControlsByGroup = function(group) {
                    var focus = false;
                    _.each($rootScope.predefinedListOfControl, function(v, k) {
                        if (!_.isUndefined(group)) {
                            if (v.groups.indexOf(group) > -1) {
                                v.dirty = false;
                                v.reset();
                            }
                        } else {
                            v.dirty = false;
                            v.reset();
                        }
                    });
                };

                /**
                 * Set all form to be dirty
                 */
                $scope.setDirty = function(id, value) {

                    _.each($rootScope.predefinedListOfControl, function(v, k) {
                        if (v.id == id) {
                            v.dirty = value;
                        }
                    });

                };

                /**
                 * Set all form to be dirty
                 */
                $rootScope.setDirtyAll = function(id, value) {

                    _.each($rootScope.predefinedListOfControl, function(v, k) {
                        v.dirty = value;
                    });

                };

                /**
                 * Remove control from validating list
                 */
                $rootScope.removeControl = function(id) {
                    $rootScope.predefinedListOfControl = _.filter($rootScope.predefinedListOfControl, function(v) {
                        return v.id != id
                    });
                };

                /**
                 * Manual function to validate
                 */

                $rootScope.validate = function(group) {
                    var isDirty = false;
                    var focus = false;
                    _.each($rootScope.predefinedListOfControl, function(v, k) {
                        if (!_.isUndefined(group)) {
                            if (v.groups.indexOf(group) > -1) {
                                var t = v.manualValidate();
                                isDirty = isDirty || t.length > 0;
                            }
                        } else {
                            var t = v.manualValidate();
                            isDirty = isDirty || t.length > 0;
                        }
                        // Focus control
                        if (isDirty && !focus && v.allowFocus){
                            focus = v.focus();
                        }
                    });
                    return isDirty;
                };

                /**
                 * Params:
                 *      @groups - array of group to disable
                 */
                $rootScope.disableGroup = function(groups, value) {
                    $rootScope.$broadcast("onDisableGroups", {
                        "groups": groups,
                        "value": value
                    });
                };

                $scope.root = $rootScope;

            }],
            //the link method does the work of setting the directive up, things like bindings, jquery calls, etc are done in here
            link: function(scope, elem, attrs, ngModel) {

                setTimeout(function() {
                    var useConfig = "string";

                    scope.$broadcast("validatorReady", useConfig);
                    scope.$apply();
                }, 500);

                if (!ngModel) {
                    return;
                }

                var elementType = elem.prop("tagName").toUpperCase();
                var configuration = {};
                configuration.elem = elem;
                configuration.tagName = elementType;
                // extends some attribute to configuration
                configuration.defaultPlaceholderText = (elementType == 'INPUT' ||
                    elementType == 'TEXTAREA' ||
                    elementType == 'SELECT') ?
                    elem.attr('placeholder') :
                    elem.text();
                // Current control id
                configuration.controlID = validator.makeid(5) + '' + (new Date().getTime());
                // Set id for the control if input has no id
                if (!elem.attr('id') || elem.attr('id').trim().length <= 0) {
                    elem.attr('id', configuration.controlID);
                }
                // Validator constant
                configuration.TIMEOUT_BEFORE_USER_RELEASE = 1000;
                configuration.TIMEOUT_BEFORE_EXECUTE = 300;
                // Validator temp pool
                configuration.temp = {};
                // validator engine
                configuration.engine = validator.getEngine(ngModel.$viewValue);
                // configuration on lost focus/reset
                configuration.event = {};

                // defined on lost focus event
                configuration.event['focus'] = function() {
                    resetError();
                };
                // enable or disable
                configuration.enableValidate = true;
                configuration.hasError = false;
                var currentTimestamp = new Date().getTime();
                /**
                 * Watcher on disable or eanble validation on this control
                 */
                var toggleValidator = attrs.$observe('validatorToggleEnabled', function (v, o){
                    if (v != null && v != undefined){
                        v = v === "true" ? true : false;
                        configuration.enableValidate = v;
                    }
                });

                var enableValidateWatcher = scope.$on("onEnableValidate", function($event, id) {
                    if (configuration.controlID == id || elem.attr('id') == id) {
                        configuration.enableValidate = true;
                    }
                });
                var disableValidateWatcher = scope.$on("onDisableValidate", function($event, id) {
                    if (configuration.controlID == id || elem.attr('id') == id) {
                        configuration.enableValidate = false;
                    }
                });
                var manualValidateWatcher = scope.$on("onManualValidate", function($event, id) {
                    if (!configuration.enableValidate){
                        return;
                    }
                    if (configuration.controlID == id || elem.attr('id') == id) {
                        validate();
                    }
                });
                var mirrorWatcher = scope.$on("onMirror", function($event, data) {
                    if (data.model == attrs.ngModel && data.id != configuration.controlID) {
                        resetError();
                        if (configuration.default.types.indexOf('phone-number') > -1) {
                            setModelValue(validator.formatPhonenumber(elem.val(), true));
                        }
                    }
                });
                var disableGroupWatcher = scope.$on("onDisableGroups", function($event, groups) {
                    var inGroup = false;
                    if (configuration.default['group-names'].length <= 0) {
                        inGroup = false;
                    } else {
                        _.each(configuration.default['group-names'], function(v, k) {
                            inGroup = inGroup || groups.groups.indexOf(v) > -1;
                        });
                    }
                    if (inGroup) {
                        configuration.enableValidate = groups.value;
                    }

                });

                // Override ngModel render system
                // model -> view
                var oldRender = ngModel.$render;
                ngModel.$render = function() {
                    if (!!oldRender) {
                        oldRender();
                    };
                    if (elementType.toLowerCase() == 'div') {
                        // elem.text(ngModel.$viewValue || elem.attr('placeholder'));
                    }
                };

                attrs.$observe("watcher", function(d) {
                    if (elementType == 'DIV') {
                        if (configuration.default) {
                            resetError();
                        }
                        ngModel.$setViewValue(d);
                        ngModel.$render();

                        // If they set on to change do call event on change
                        if (configuration.default &&
                            configuration.default.on &&
                            configuration.default.on.indexOf('change') > -1 &&
                            configuration.event['change']) {
                            configuration.event['change']();
                        }
                    }
                });

                // Core validation function
                function validate() {
                    if (!configuration.enableValidate){
                        return [];
                    }
                    configuration.engine.setEngineBaseValue(ngModel.$viewValue);
                    var error = [];
                    _.each(configuration.default.types, function(v, k) {
                        var responsed = true;
                        var responsed_object_date;

                        switch (v) {
                            case 'required':
                                responsed = responsed && configuration.engine.handleRequired();
                                // if (!responsed){
                                //     console.log(ngModel.$viewValue);
                                //     console.log(configuration);
                                // }
                                break;
                            case 'numeric':
                                responsed = responsed && configuration.engine.handleNumeric(configuration.default['min-number']);
                                break;
                            case 'email':
                                responsed = responsed && configuration.engine.handleEmail();
                                break;
                            case 'phone-number':
                                responsed = responsed && configuration.engine.handlePhonenumber();
                                break;
                            case 'date':
                                responsed = responsed && configuration.engine.handleDate(configuration.default['date-format']);
                                break;
                            case 'pair':
                                responsed = responsed && configuration.engine.handlePair($('#' + configuration.default['pair-id']).val());
                                break;
                            case 'pair-date':
                                if (configuration.default['pair-type'].toLowerCase() == 'start') {
                                    responsed_object_date =
                                        configuration.engine.handleDateRange(
                                            configuration.default['date-format'], [configuration.default['min-value']], [configuration.default['max-value'],
                                                angular.element('#' + configuration.default['pair-id']).val()
                                            ]
                                    );
                                    responsed = responsed && (responsed_object_date['min'] == true && responsed_object_date['max'] == true);

                                } else if (configuration.default['pair-type'].toLowerCase() == 'end') {
                                    responsed_object_date =
                                        configuration.engine.handleDateRange(
                                            configuration.default['date-format'], [configuration.default['min-value'],
                                                angular.element('#' + configuration.default['pair-id']).val()
                                            ], [configuration.default['max-value']]
                                    );
                                    responsed = responsed && (responsed_object_date['min'] == true && responsed_object_date['max'] == true);
                                } else {
                                    responsed = responsed && false;
                                }
                                break;
                            case 'reg-exp':
                                responsed = responsed &&
                                    configuration.engine.handleRegExp(configuration.default['reg-exp']);
                                break;
                            default:
                                responsed = responsed && true;
                        }
                        if (!responsed) {
                            error.push({
                                "type": v,
                                "dirty": true,
                                "extras": responsed_object_date
                            });
                        }
                    });
                    if (configuration.timeout){
                        $timeout.cancel(configuration.timeout);
                    }
                    // console.log(error, configuration.defaultPlaceholderText, configuration.tagName, configuration.controlID);
                    // If error occur to apply error
                    // if (error.length > 0 && !configuration.hasError) {
                    if (error.length > 0) {
                        configuration.timeout = $timeout(function (){
                            applyError(error);
                        }, configuration.TIMEOUT_BEFORE_EXECUTE);
                    }
                    return error;
                }

                // reset
                function resetError() {
                    // Reset to default placeholder
                    if ((elementType == 'INPUT' || elementType == 'TEXTAREA' || elementType == 'SELECT')) {
                        elem.attr('placeholder', configuration.defaultPlaceholderText);
                    } else if (elementType == 'DIV'){
                        // if (!ngModel.$viewValue) {
                        //     elem.text(configuration.defaultPlaceholderText);
                        // }
                    }
                    // Remove validation error class
                    if (!_.isUndefined(configuration.default['custom-error-class']) &&
                        configuration.default['custom-error-class'].trim().length > 0) {

                        if (configuration.default['select2'] === true){
                            elem.parent().removeClass(configuration.default['custom-error-class']);    
                        }
                        else if (configuration.default['selectize'] === true){
                            elem.parent().children('.selectize-control').children('.selectize-input').removeClass(configuration.default['custom-error-class']);    
                        }
                        else{
                            elem.removeClass(configuration.default['custom-error-class']);    
                        }                                
                    }
                    // Set current form element dirty to false
                    scope.setDirty(configuration.controlID, false);
                    configuration.hasError = false;
                }

                function setModelValue(value) {
                    ngModel.$setViewValue(value);
                    ngModel.$viewValue = value;
                    ngModel.$render();
                    configuration.engine.setEngineBaseValue(ngModel.$viewValue);
                }

                // Apply error
                function applyError(errorObject) {
                    if (!configuration){
                        return;
                    }
                    // Set model value to null and rerender model value
                    setModelValue(configuration.default['default-value'] || null);
                    // Apply error placeholder if has
                    if (!_.isUndefined(configuration.default['custom-error-message']) &&
                        configuration.default['custom-error-message'].trim().length > 0) {
                        // Set the place holder value
                        elem.attr('placeholder', configuration.default['custom-error-message']);

                        // Set placeholder for div element
                        // If the control is a div, set default placeholder
                        if (elementType == 'DIV') {
                            // elem.text(configuration.default['custom-error-message']);
                        }
                    }
                    // Apply validation error class
                    if (!_.isUndefined(configuration.default['custom-error-class']) &&
                        configuration.default['custom-error-class'].trim().length > 0) {
                        if (configuration.default['select2'] === true){
                            elem.parent().addClass(configuration.default['custom-error-class']);
                        }
                        else if (configuration.default['selectize'] === true){
                            elem.parent().children('.selectize-control').children('.selectize-input').addClass(configuration.default['custom-error-class']);    
                        }
                        else{
                            elem.addClass(configuration.default['custom-error-class']);    
                        }
                        
                    }

                    // Broadcast if need
                    if (!_.isUndefined(configuration.default['broadcast-event']) &&
                        configuration.default['broadcast-event'].length > 0) {
                        scope.root.$broadcast(
                            configuration.default['broadcast-event'], {
                                "controlID": (elem.attr('id') || configuration.controlID),
                                'falsy': true,
                                'extras': errorObject
                            });
                    }

                    // Set current form element dirty to true
                    scope.setDirty(configuration.controlID, true);
                    configuration.hasError = true;

                }
                // Init current form dirtiness
                function init() {
                    scope.root.predefinedListOfControl.push({
                        id: configuration.controlID,
                        index: configuration.default['index'] * 1 || (scope.root.predefinedListOfControl.length + 1),
                        friendlyId: elem.attr('id'),
                        modelName: attrs.ngModel,
                        dirty: false,
                        groups: configuration.default['group-names'],
                        allowFocus: configuration.default['allow-focus'] === undefined ? configuration.default['allow-focus'] * 1 : true,
                        reset: function() {
                            resetError();
                        },
                        disableValidate: function() {
                            scope.root.$broadcast("onEnableValidate", configuration.controlID);
                        },
                        enableValidate: function() {
                            scope.root.$broadcast("onDisableValidate", configuration.controlID);
                        },
                        manualValidate: function() {
                            return validate();
                        },
                        focus: function (){
                            if (configuration.default['allow-focus'] * 1){
                                var offsetTop = configuration.default['focus-top-offset'] * 1 || 40;

                                var elemToScroll = null;
                                if (configuration.default['select2'] === true || configuration.default['selectize'] === true){
                                    elemToScroll = elem.parent();
                                }
                                else{
                                    elemToScroll = elem;
                                }
                                if (configuration.default['modal-scroll']){
                                    var top = elemToScroll.position().top - offsetTop;
                                    top = top < 0 ? 0 : top;
                                    $('#' + configuration.default['modal-scroll']).animate({
                                        scrollTop: top
                                    }, 400);
                                }
                                else{
                                    var top = elemToScroll.offset().top - offsetTop;
                                    top = top < 0 ? 0 : top;
                                    $('html, body').animate({
                                        scrollTop: top
                                    }, 400);
                                }
                                elemToScroll = null;
                                return true;
                            }
                            else{
                                return false;
                            }

                        }

                    });

                    // If the control is a div, set default placeholder
                    if (elementType == 'DIV') {
                        if (!attrs.watcher) {
                            // elem.text(elem.attr('placeholder'));
                        }
                        // Set on change event, EXCEPTION for the non-editable content
                        configuration.event['change'] = function() {
                            
                            if (!configuration.enableValidate) {
                                return true;
                            }
                            configuration.engine.setEngineBaseValue(ngModel.$viewValue);
                        };
                    }

                }

                function applyEvent() {
                    // Register some set of predefined event
                    if (!_.isUndefined(configuration.default["realtime"]) ||
                        configuration.default["realtime"] != 'false') {

                        // On key press
                        configuration.event["keypress"] = function(e) {

                            if (!configuration.enableValidate) {
                                return true;
                            }

                            if (configuration.default.types.indexOf('phone-number') > -1) {
                                var isValidPhoneKey = validator.isPhoneKey(e.originalEvent);
                                if (isValidPhoneKey) {
                                    var timestampOnkeypress = new Date().getTime();
                                    if (timestampOnkeypress - currentTimestamp < configuration.TIMEOUT_BEFORE_USER_RELEASE) {
                                        configuration.temp.promiseKeypress = setTimeout(function() {
                                            setModelValue(validator.formatPhonenumber(elem.val(), true));
                                        }, configuration.TIMEOUT_BEFORE_EXECUTE);
                                        currentTimestamp = timestampOnkeypress;
                                        return;
                                    }
                                    currentTimestamp = timestampOnkeypress;
                                    setModelValue(validator.formatPhonenumber(elem.val(), true));

                                    return true;
                                } else {
                                    return false;
                                }
                                return;
                            }
                            if (configuration.default.types.indexOf('numeric') > -1) {
                                return validator.isNumberKey(e.originalEvent) || e.keyCode == 190 || (e.keyCode >= 37 && e.keyCode <= 40);
                            }
                        };

                        // On focus
                        configuration.event["focus"] = function() {
                            resetError();
                            scope.$broadcast("onMirror", {
                                'model': attrs.ngModel,
                                'id': configuration.controlID
                            });
                            if (!configuration.enableValidate) {
                                return;
                            }
                            if (configuration.default.types.indexOf('phone-number') > -1) {
                                setModelValue(validator.formatPhonenumber(elem.val(), false));
                            }
                        };

                        // On focus
                        configuration.event["change"] = function() {
                            resetError();
                            scope.$broadcast("onMirror", {
                                'model': attrs.ngModel,
                                'id': configuration.controlID
                            });
                            if (!configuration.enableValidate) {
                                return;
                            }
                            if (configuration.default.types.indexOf('phone-number') > -1) {
                                setModelValue(validator.formatPhonenumber(elem.val(), false));
                            }
                        };

                        // On blur
                        configuration.event['blur'] = function(e) {
                            if (!configuration.enableValidate) {
                                return;
                            }
                            if (configuration.default.types.indexOf('phone-number') > -1) {
                                setModelValue(validator.formatPhonenumber(elem.val(), true));
                            }
                        };

                        elem.on("keydown", function(e) {
                            return configuration.event['keypress'](e);
                        });

                        elem.on("focus", function(e) {
                            configuration.event['focus'](e);
                        });

                        elem.on("blur", function(e) {
                            configuration.event['blur'](e);
                        });

                        elem.on("change", function(e) {
                            configuration.event['change'](e);
                        });

                    }

                }
                // Validate form using group
                // On validator ready
                scope.$on("validatorReady", function(event, value) {
                    if (configuration == null) {
                        return;
                    }
                    if (configuration.init) {
                        return; // Only once
                    }
                    configuration.init = true;
                    var config = attrs.validatorconfig || attrs.config;
                    configuration.default = angular.fromJson(config);

                    if (!_.isUndefined(configuration.default.disable))
                        configuration.enableValidate = !configuration.default.disable;

                    init();
                    applyEvent();
                    // var substitute = {
                    //  'change': 'input propertychange paste'
                    // };
                    // Check on binding to event
                    if (configuration.default.on) {
                        _.each(configuration.default.on, function(v) {

                            if (v != 'custom') {
                                elem.on(v, function(e) {
                                    if (!configuration.enableValidate) {
                                        return true;
                                    }
                                    validate();
                                    if (configuration.event[v]) {
                                        return configuration.event[v](e);
                                    }
                                });
                            }
                        });
                    }

                });
                // ==================================================== On scope exit handler
                scope.$on("$destroy", function() {
                    // Unregister watcher
                    manualValidateWatcher();
                    enableValidateWatcher();
                    toggleValidator();
                    disableValidateWatcher();
                    disableGroupWatcher();
                    // Clear from memory
                    scope.root.removeControl(configuration.controlID);
                    configuration = null;
                    delete configuration;
                });

            }
        }
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