Eve = {};

OAuth.registerService('eve', 2, null, function(query) {

  var response = getTokens(query);
  var accessToken = response.accessToken;
  var identity = getIdentity(accessToken);

  var serviceData = {
    accessToken: accessToken,
    expiresAt: (+new Date()) + (1000 * response.expiresIn)
  };

  var fields = {
    character: {
      id: identity.CharacterID,
      name: identity.CharacterName
    },
    id: identity.CharacterOwnerHash
  };
  _.extend(serviceData, fields);

  // only set the token in serviceData if it's there. this ensures
  // that we don't lose old ones (since we only get this on the first
  // log in attempt)
  if (response.refreshToken)
    serviceData.refreshToken = response.refreshToken;

  return {
    serviceData: serviceData,
    options: {profile: {name: identity.CharacterName}}
  };
});

// returns an object containing:
// - accessToken
// - expiresIn: lifetime of token in seconds
// - refreshToken, if this is the first authorization request
var getTokens = function (query) {
  var config = ServiceConfiguration.configurations.findOne({service: 'eve'});
  if (!config)
    throw new ServiceConfiguration.ConfigError();


  var response;
  try {
    response = HTTP.post(
      "https://login.eveonline.com/oauth/token", {
        headers: {
          Authorization: 'Basic ' + new Buffer(config.clientId + ':' + OAuth.openSecret(config.secret)).toString('base64')
        },
        params: {
          code: query.code,
          grant_type: 'authorization_code'
      }});
  } catch (err) {
    throw _.extend(new Error("Failed to complete OAuth handshake with CCP. " + err.message),
                   {response: err.response});
  }

  if (response.data.error) { // if the http response was a json object with an error attribute
    throw new Error("Failed to complete OAuth handshake with CCP. " + response.data.error);
  } else {
    return {
      accessToken: response.data.access_token,
      refreshToken: response.data.refresh_token,
      expiresIn: response.data.expires_in
    };
  }
};

var getIdentity = function (accessToken) {
  var config = ServiceConfiguration.configurations.findOne({service: 'eve'});
  try {
    var response = HTTP.get(
      "https://login.eveonline.com/oauth/verify",
      {headers: {Authorization: 'Bearer ' + accessToken}});
    return response.data;
  } catch (err) {
    throw _.extend(new Error("Failed to fetch identity from CCP's SSO service." + err.message),
                   {response: err.response});
  }
};


Eve.retrieveCredential = function(credentialToken, credentialSecret) {
  return OAuth.retrieveCredential(credentialToken, credentialSecret);
};
