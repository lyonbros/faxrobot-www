var STATUS_POLL_DELAY = 2000;
var SUPPORTED_FILETYPES = ['doc', 'docx', 'pdf', 'txt'];
var PAYMENT_DEFAULT_AMOUNT = PAYMENT_DEFAULT_AMOUNT || 2;

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
        title: 'Please enter a U.S. or Canadian fax number.',
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
    }
]