
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