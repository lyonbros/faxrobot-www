var routes = {
    '/': ['jobs', 'create'],
    '/jobs': ['jobs', 'list'],
    '/jobs/([a-z]+)/([0-9]+)': ['jobs', 'list'],
    '/job/([a-z0-9]+)': ['jobs', 'view'],
    '/accounts/login': ['accounts', 'login'],
    '/accounts/logout': ['accounts', 'logout'],
    '/accounts/register': ['accounts', 'register'],
    '/reset/([a-z0-9]+)': ['accounts', 'reset_password'],
    '/account': ['accounts', 'manage'],
    '/transactions': ['accounts', 'transactions'],
    '/transactions/([0-9]+)': ['accounts', 'transactions'],
    '/faq': ['pages', 'faq'],
    '/faq/([a-z0-9]+)': ['pages', 'faq'],
    '/api': ['pages', 'api'],
    '/api/([a-z0-9]+)': ['pages', 'api'],
    '/privacy': ['pages', 'privacy'],
    '/tos': ['pages', 'tos'],
     // easy way to do a catch-all
    '.*': ['pages', 'not_found']
}