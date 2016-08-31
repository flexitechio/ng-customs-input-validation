# ng-customs-input-validation
## Angular module custom input validation
An angular module developed the Flexitech to validate the input, select box, and other controls based on ngModel of the input.

## Update Notes

- Initial source build
- Update readme

## What is Slash.Us?

##Installation

You can easily add a script link by install using bower install.

### Bower

`bower install https://github.com/flexitechio/ng-customs-input-validation#master`

## How to use

Adding the validate module to your angular app

```js

var deps = ['util-flexitech.validate'];
var app = angular.module('utilValidatorDemo', deps);

app.run(['$rootScope', function ($rootScope){
	console.log('The app is actually running!');
}]);

```

Adding validator directive to the input

```html
<input type="text" 
	ng-model="price" class="form-control"
	placeholder="Tax Payment (Riel)"
	util-validator validatorconfig='
    {
      "types":["numeric"],
      "group-names" : ["shipment"],
      "custom-error-class" : "__has-error",
      "custom-error-message" : "Please, enter numeric ",
      "on": ["blur", "change"],
      "allow-focus": true,
      "focus-top-offset": 110,
      "selectize": false
    }'>

```

## API Reference

All possible configuration:

```javascript
{
	// REQUIRED
	"type" : "required|numeric|email|phone-number|pair|date|pair-date|complex-password|numeric|reg-exp", OR
	"types" : ["Array of type can handle different type"],
	"group-name" : "one can have many validation group", OR
	"group-names" : "one control can be in many group",
	"custom-error-class" : "class name",
	"custom-error-message" : "message",
	"on" : "validation on focus|blur|keypress|keyup|keypressed|change|custom", (custom event required u defined the config as a configObject instead of string config)
	// OPTIONAL or REQUIRED by TYPE
	"date-format" : "mm-dd-yyyy", (date,pair-date)
	"id"  : "unique id of current control", (pair, pair-date)
	"pair-id" : "id of other control to check pair with" , (pair, pair-date),
	"pair-type" : "start|end id of other control to check pair with" , (pair, pair-date),
	"min-value" : "the number or date or timestamp of min value", (date, numeric, pair-date),
	"max-value" : "the number or date or timestap of max value" , (date, numeric, pair-date),
	"reg-exp" : "the regular express used to validate",
	"broadcast-event" : " defined event name that the scope can be listened that when error occur this directive will broadcast" ,
	"serialize" : "serialize or format to",
	"realtime" : "true|false" (turn validate/format in realtime on or off such as phone, date, numeric),
	"disable" : "true|false",
	"allow-focus": "true|false",
	"selectize": "true|false",
	"select2": 	"true|false",
	"modal-scroll": "modal ID that input are on",
	"index": "seq"
}

```

## Todo

- Add detailed documentation of all control type.
- Add test
- Test the performance and try to optimize the performance
- Fix bugs

## Development

Build the release

`gulp`

## Author

Flexitech.io (c) 2016
