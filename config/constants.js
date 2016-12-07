var STATUS_POLL_DELAY = 2000;
var SUPPORTED_FILETYPES = ['doc', 'docx', 'pdf', 'txt', 'png', 'jpg'];
var PAYMENT_DEFAULT_AMOUNT = PAYMENT_DEFAULT_AMOUNT || 3;

var ERR_ACCESS_DENIED = 401;
var ERR_NO_FILE_ATTACHED = 101;
var ERR_BAD_DESTINATION = 102;

var ERRORS = [
    {
        code: 0,
        title: 'An error has occurred!',
        detail: 'Don\'t worry. It probably wasn\'t your fault. Maybe. Please try to do what you were doing again, and let us know if the problem persists.'
    },
    {
        code: 100,
        title: 'File not supported',
        detail: 'Currently, the following file formats are supported: {SUPPORTED_FILETYPES}.'
    },
    {
        code: 101,
        title: 'Please choose a file.',
        detail: 'You can use any file of the following formats: {SUPPORTED_FILETYPES}.'
    },
    {
        code: 102,
        title: 'Please enter a valid fax number.',
        detail: 'Don\'t forget to include an area code :)'
    },
    {
        code: 103,
        title: 'Credit Card Error',
        detail: 'There was a problem authorizing the credit card information you provided. Please check the info and try again.'
    },
    {
        code: 104,
        title: 'Credit Card Error',
        detail: 'We ran into a problem saving your credit card info. Whoops. Try again?'
    },
    {
        code: 401,
        title: 'Access denied :-)',
        detail: 'You\'re not authorized to access whatever it was you were trying to access.'
    },
    {
        code: 513,
        title: 'Insufficient credit.',
        detail: 'Your account didn\'t have enough credit remaining to send the fax. Please add credit and try again.'
    },
    {
        code: 516,
        title: 'No answer.',
        detail: 'The number you dialed did not pick up or was not a fax machine. This transaction is still billed.'
    },
    {
        code: 517,
        title: 'Line busy.',
        detail: 'Please try again later.'
    },
    {
        // should never see this error.
        code: 518,
        title: 'File not supported',
        detail: 'Currently, the following file formats are supported: {SUPPORTED_FILETYPES}.'
    },
    {
        code: 520,
        title: 'Payment failed.',
        detail: 'Your account ran out of funds and we were unable to authorized the stored credit card info. Please add credit and try again.'
    },
    {
        code: 527,
        title: 'Invalid phone number.',
        detail: 'The specified fax number was invalid or not formatted correctly.'
    },
    {
        code: 600,
        title: 'Unable to provision your number.',
        detail: 'An uncommon error occurred with our telecommunications provider. Sorry! Please contact {SUPPORT_MAILTO}.'
    },
    {
        code: 601,
        title: 'Please try a different area code.',
        detail: 'The area code you chose is invalid or has no numbers available at this time.'
    },
    {
        code: 602,
        title: 'You already set up your receiving fax number!',
        detail: 'Check it out here on your Account Settings page.'
    },
    {
        code: 603,
        title: 'Well that didn\'t work...',
        detail: 'You tried to delete your incoming fax number, but it looks like it was already removed from the account.'
    },
    {
        code: 604,
        title: 'Unable to disable your fax number :(',
        detail: 'Something went wrong with our telecommunications provider. Sorry! Please contact {SUPPORT_MAILTO}.'
    },
]