Package.describe({
  name: 'zweizeichen:accounts-eve',
  summary: 'Authentication for EVE Online\'s SSO service. Works like e.g. \'accounts-github\'.',
  version: '1.0.0',
  git: 'https://github.com/zweizeichen/accounts-eve.git'
});

Package.onUse(function(api) {
  api.versionsFrom('1.0');

  api.use('accounts-base', ['client', 'server']);
  api.imply('accounts-base');

  api.use('accounts-oauth', ['client', 'server']);
  api.use('oauth2', ['client', 'server']);
  api.use('oauth', ['client', 'server']);
  api.use('http', ['server']);
  api.use('templating', 'client');
  api.use('underscore', 'server');
  api.use('random', 'client');
  api.use('service-configuration', ['client', 'server']);

  api.export('Eve');

  api.addFiles('eve.js', ['client', 'server']);
  api.addFiles(['eve_client.js',
                'eve_configure.html',
                'eve_configure.js' ,
                'eve_login_button.css'], 'client');

  api.addFiles('eve_server.js', 'server');
});

Package.onTest(function(api) {
  api.use('tinytest');
  api.use('zweizeichen:accounts-eve');
  api.addFiles('zweizeichen:accounts-eve-tests.js');
});
