/* Author: 
    Michael Baxter  
*/

$(document).ready(function() {

    var dobHandler = function() {
        
        var maxPossibleDays = 31; //max number of days in ANY month
        var maxPossibleMonths = 12; //max number of months in ANY year
        var now = new Date() // current date (day, month, year)
        var currentYear = now.getFullYear(); //current year
        var currentMonth = now.getMonth(); //current month
        var currentDay = now.getDay(); //current day
        var minPossibleYears = currentYear - 111; //year someone 111 yrs old was born
        var remainderYears = currentYear - 2000; //years since yr 2000 (used for autoAppender)
        var validationShowing = false; //track the showing of validation messages to avoid duplicates
        var newFocus;

        var keyMapping = { //maps keypress values to numerals
            'n48': 0,
            'n49': 1,
            'n50': 2,
            'n51': 3,
            'n52': 4,
            'n53': 5,
            'n54': 6,
            'n55': 7,
            'n56': 8,
            'n57': 9
        };

        var monthMapping = { //maps days in each month
            'm01': 31,
            'm02': 29, //this is the leap year length... see below
            'm03': 31,
            'm04': 30,
            'm05': 31,
            'm06': 30,
            'm07': 31,
            'm08': 31,
            'm09': 30,
            'm10': 31,
            'm11': 30,
            'm12': 31,
            'm13': 28 //13th month is Feb during a non-leap year
        }

        var monthNames = { // maps abbreviated names for each month of the year
            'm01': 'Jan',
            'm02': 'Feb', //this is the leap year length... see below
            'm03': 'Mar',
            'm04': 'Apr',
            'm05': 'May',
            'm06': 'Jun',
            'm07': 'Jul',
            'm08': 'Aug',
            'm09': 'Sep',
            'm10': 'Oct',
            'm11': 'Nov',
            'm12': 'Dec',
            'm13': 'Feb'
        }

        var init = function() {
            //initialise the elements within the Date of Birth area
            //add hover states to the field
            // run over each field on init and add 0's to
            // all field with single digit numbers
            $('.dob-wrapper').addClass('active');
            $('.dob-wrapper input').each(function(event){
                // create the placeholder spans for each field
                $(this).after('<span class="placeholder">' + $(this).attr('rel') + '</span>')
                .next('.placeholder').css({
                    'left': $(this).position().left,
                    'width': $(this).width()
                }).on('click', function(e) {
                    $(this).hide().prev('input').focus();
                });

                // bind focus and blur functions to each field.
                $(this).on('focus', function(event) {
                    $(this).parent('.dob-wrapper').addClass('focus');
                    $(this).next('.placeholder').hide(); 
                    //$(this).val(autoAppender($(this).val(), 'strip'));
                    //this.selectionStart = this.selectionEnd = this.value.length;
                    //newFocus = $(this).attr('id');
                }).on('blur', function(e) {
                    $(this).val(autoAppender($(this).val(), $(this).attr('id')));                    
                    checkOnBlur(this);
                    $(this).parent('.dob-wrapper').removeClass('focus').siblings('.hint').hide();
                    if (!$(this).val()) {
                        $(this).next('.placeholder').show();
                    }
                }).on('keydown', function(e) {
                    keyDownPressed(e, this);
                    //restrictInput(this, $(this).attr('id'), event);
                });
                if ($(this).val()) {
                    $(this).val(autoAppender($(this).val()))
                    .next('.placeholder').hide();
                }
            });
        }

        var keyDownPressed = function(e, el) {
            type = $(el).attr('id');
            // controlKeys = backspace, tab, enter, shift, ctrl, alt, end, home, left arr, right arr, delete
            var controlKeys = [8, 9, 13, 16, 17, 18, 35, 36, 37, 39, 46];
            var isControlKey = controlKeys.join(",").match(new RegExp(e.which));
            if (isControlKey) {
                hideValidationError(); //hide any showing validation errors
                if (e.which == 8) { //backspace has been pressed
                    checkForBackTab(el, e);
                }
                return;
            } else if (e.which == 191) {
                e.preventDefault();
                if (type == 'dob-day') {
                    $('#dob-month').focus();
                } else if (type == 'dob-month') {
                    $('#dob-year').focus();
                } else {
                  return;  
                }
            } else {
                if (48 <= e.which && e.which <= 57) {
                    var mappedKey = keyMapping['n' + e.which];
                } else if (96 <= e.which && e.which <= 105) {
                    var mappedKey = keyMapping['n' + (e.which - 48)];
                } else {
                    showValidationError('Numerals only');
                    e.preventDefault();
                    return;
                }
                hideValidationError();
                testInputContents(e, el, mappedKey);
            }
        }

        var checkOnBlur = function(el) {
            var haveError   = false,
                errorFields = [];
            if (!checkValidDays($('#dob-day').val())) {
                errorFields.push('day');
                haveError = true;
            }
            if (!checkValidMonth($('#dob-month').val())) {
                errorFields.push('month');
                haveError = true;
            }
            if (!checkValidYear($('#dob-year').val())) {
                errorFields.push('year');
                haveError = true;
            }

            if (haveError) {
                message = 'invalid ' + errorFields.join(', ');
                showValidationError(message);
            } else {
                hideValidationError();
            }
        }

        
        var showValidationError = function(message) {
            if (!validationShowing) {
                validationShowing = true;
                $('.dob .validation').hide().html('<span>'+ message +'</span>')
                $('.dob .validation').fadeIn('fast');
                $('.dob-wrapper').addClass('error');
            }
        }

        var hideValidationError = function() {
            if (validationShowing) {
                $('.dob .validation').hide().html('');
                $('.dob-wrapper').removeClass('error');
                validationShowing = false;
            }
        }

        var isLeapYear = function(year) {
            // function to determine if a supplied year is a leap year
            // returns boolean. true = is a leap year
            if ((parseInt(year)%4) == 0) {
                if (parseInt(year)%100 == 0) {
                    if (parseInt(year)%400 != 0) {
                        return false;
                    } else {
                        return true;
                    }
                } return true;
            } else {
                return false;
            }
        }

        var autoAppender = function(testValue, type) {
            // check to see if the contents of the field is a number
            // below 10 and if true, add a '0' to the front of the number
            // or strip a 0 from a number below 10 if required
            numTestValue = +testValue;
            if (type == 'dob-day' || type == 'dob-month' || !type) {
                if (testValue && (0 < numTestValue && numTestValue < 10)) {
                    return '0' + numTestValue;
                } else if (numTestValue) {
                    return numTestValue;
                } else {
                    return testValue;
                }
            } else if (type == 'dob-year') {
                //check to see if the year is less than 3 chars long, and if
                // true return a guess at the century as either 2000 or 1900
                // based on the number of years since 2000.
                if (!testValue || testValue.length > 2) {
                    return testValue;
                } else {
                    switch (true) {
                        case (numTestValue < 10):
                            return "200" + numTestValue;
                            break;
                        case (numTestValue <= remainderYears):
                            return "20" + numTestValue;
                            break;
                        default:
                            return "19" + numTestValue;
                            break;
                    }
                }
            } else {
                // type = strip or true
                if (testValue && numTestValue < 10) {
                    return numTestValue;
                } else {
                    return testValue;
                }
            }
        }

        var checkForBackTab = function(el, e) {
            // check if the current field (type) has content
            // and if not, move back to the previous field
            // when the backspace key is pressed
            type = $(el).attr('id');
            if (type == 'dob-month' && $(el).val().length < 1) {
                $('#dob-day').focus();
                e.preventDefault();
            } else if (type == 'dob-year' && $(el).val().length < 1) {
                $('#dob-month').focus();
                e.preventDefault();
            } else {
                return;
            }
        }

        var checkValidDays = function(days) {
            // checks the maximum number of days in a given month
            // on a given year or returns the max possible (31)
            month = $('#dob-month').val();
            year  = $('#dob-year').val();
            
            if (!days) {
                return true;
            }

            days = +days; //+variable is a hack to avoid parseInt issues in IE

            if (!month || !checkValidMonth(month)) {
                return (0 < days && days <= maxPossibleDays) ? true : false;
            } else if (month == '02' && year) {
                if (isLeapYear(year)) {
                    return (days <= monthMapping['m02']) ? true : false;

                } else {
                    if (days < monthMapping['m02']) {
                        return true;
                    } else if (days == 29) {
                        //showValidationError('Invalid - only 28 days in ' + monthNames["m02"] + ' ' + year);
                        return false;
                    } else {
                        //showValidationError('Invalid day');
                        return false
                    }
                }
            } else if (year >= currentYear && month >= currentMonth && day >= currentDay) {
                return false;
            } else {
                return (days <= monthMapping['m' + month]) ? true : false;
            }
        }

        var checkValidMonth = function(month) {
            // checks the month entered is a valid month
            // considering the year and day entered (if any)
            if (!month) {
                return true;
            }
            days  = $('#dob-day').val();
            year  = $('#dob-year').val();
            month = autoAppender(String(month), 'dob-month');
            
            if (!days) {
                // no days to validate against, return maxPossibleMonths
                return (+month <= maxPossibleMonths) ? true : false;
            } else if ((month == '02' && !year) || 
                       (month == '02' && isLeapYear(parseInt(year)))) {
                // month is Feb, no year supplied, or is leap year, return 29
                if (+days <= monthMapping["m02"]) {
                    return true;
                } else {
                    showValidationError('There are not ' + days + ' days in Feb.');
                    return false;
                }
            } else if (month == '02') {
                // month is Feb, we know the year, and it's not a leap year
                // return 28
                if (parseInt(days) > monthMapping["m13"]) {
                    //showValidationError('Feb only has 28 days in ' + year);
                    return false;
                } else {
                    return true;
                }
            } else if (month > maxPossibleMonths) {
                return false;
            } else if (year >= currentYear && month >= currentMonth && day >= currentDay) {
                return false;
            } else {
                // return the validation for the month entered
                if (+days <= monthMapping["m" + month]) {
                    return true;
                } else {
                    //showValidationError('Invalid month');
                    return false;
                } 
            }

        }

        var checkValidYear = function(year) {
            //because of the validation code, this should always 
            //receive a 4 digit year as input

            days = $('#dob-day').val();
            month = $('#dob-month').val();
            if (!year) {
                return true;
            } else if (month == '02' && days == '29') {
                if (isLeapYear(year)) {
                    return true;
                } else {
                    showValidationError(year + ' was not a leap year');
                    return false;
                }
            } else if ((parseInt(year) <= minPossibleYears) || 
                       (currentYear < parseInt(year))) {
                //showValidationError('Invalid year');
                return false;
            } else if (parseInt(year) == currentYear) {
                if (parseInt(month) > currentMonth) {
                    //showValidationError('Invalid year');
                    return false;
                } else if (parseInt(month) == currentMonth) {
                    if (parseInt(days) > currentDay) {
                        //showValidationError('Invalid year');
                        return false;
                    }
                }
                return true;
            } else if (year >= currentYear && month >= currentMonth && day >= currentDay) {
                return false;
            } else {
                return true;
            }

        }
      

        var testInputContents = function(e, el, mappedKey) {
            e.preventDefault();
            type = $(el).attr('id');
            newInput = $(el).val() + mappedKey;
            // look up the key pressed and the field it's in
            // and test to see if the number is valid
            // allow valid inputs, deny invalid ones
            if (type == 'dob-day') {
                // validate the input of the day field
                switch (newInput.length) {
                    case 1: //no previous input
                        $(el).val(newInput);
                        break;

                    case 2: //number previously inserted
                        if (checkValidDays(parseInt(newInput))) {
                            $(el).val(newInput);
                            $('#dob-month').focus();
                        } else {
                            $(el).val(newInput);
                            showValidationError('Invalid day')
                        }
                        break;

                    case 3: //already contained 2 numbers
                        $(el).val(mappedKey);
                        break;

                    default:
                        break;
                }
                return;
            } else if (type == 'dob-month') {
                // validate the input of the month field
                switch (newInput.length) {
                    case 1: // no previous input
                        $(el).val(newInput);
                        break;
                    case 2: // there was a previous input
                        if (checkValidMonth(parseInt(newInput))) {
                            $(el).val(newInput);
                            $('#dob-year').focus();
                        } else {
                            $(el).val(newInput);
                            showValidationError('Invalid month')
                        }
                        break;
                    
                    case 3: //already contained 2 numbers
                        $(el).val(mappedKey);
                        break;

                    default:
                        break;
                }
            } else { // type = 'dob-year'
                // validate the input of the year field
                switch (newInput.length) {
                    case 1: // no previous input
                        $(el).val(newInput);
                        break;

                    case 2:
                        if ((parseInt(newInput) == 19) || (parseInt(newInput) == 20)) {
                            $(el).val(newInput);
                            return; // keep allowing input
                        } else {
                            newInput = autoAppender(newInput, 'dob-year');
                            if (checkValidYear(newInput)) {
                                $(el).val(newInput);
                                // $(element).blur(); 
                                // commented out to remove blurring... 
                                // may need to test this more
                            } else {
                               $(el).val(newInput);
                               showValidationError('Invalid year')
                            }
                        }
                        break;

                    case 3:
                        $(el).val(newInput);
                        break;

                    case 4:
                        // test the year here
                        if (checkValidYear(parseInt(newInput))) {
                            // this year is valid
                            $(el).val(parseInt(newInput));
                            //$(element).blur();
                        } else {
                            $(el).val(newInput);
                            showValidationError('Invalid year')
                        }
                        break;

                    case 5:
                        // field already contains 4 digits
                        break;

                    default:
                        break;
                }
            }
        }
        //call the init script
        init();
        return {
            testName: keyDownPressed
        };
    }()

    $('form input').on('focus', function(event) {
        $(this).siblings('.hint').fadeIn('fast');
    }).on('blur', function(event) {
        $(this).siblings('.hint').hide();
    })

    $('#test-field').on('keydown', function(e) {
        e.preventDefault();
        dobHandler.testName(e, $(this));
    });

});