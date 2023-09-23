import { default as authConfig } from "../../config.json";
import React, { useEffect, useState } from 'react';
import axios from "axios";

function manualSignIn() {
    console.log("Manual signin: ");
    var clientId;
    var redirectUri;
    var authorizationEndpoint;
    var responseType;
    var scope;
    if (authConfig.IS.enabled == true) {
      clientId = authConfig.IS.clientID;
      redirectUri = authConfig.IS.signInRedirectURL;
      authorizationEndpoint = authConfig.IS.authEndpoint;
      responseType = 'code';
      scope = 'openid profile email groups roles address';
    } else {
      clientId = authConfig.Auth0.clientID;
      redirectUri = authConfig.Auth0.signInRedirectURL;
      authorizationEndpoint = authConfig.Auth0.authEndpoint;
      responseType = 'code';
      scope = 'openid profile email groups roles address';
    }
    // build the authorization URL
    console.log(authConfig.IS.tenantDomain);
    console.log(clientId);
    const url = `${authorizationEndpoint}?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=${responseType}&scope=${scope}&tenantDomain=${authConfig.IS.tenantDomain}&tenameDom=${authConfig.IS.tenantDomain}`;
    console.log(url)
    // redirect the user to the authorization URL
    window.location.href = url;
  }

async function manualGetToken(code, redirect_uri) {
    console.log("Manual get token START: " + code);
    var data;
    var headers;
    var tokenEndpoint;
    if (authConfig.IS.enabled == true) {
      console.log(" IDENTITY SERVER !! token !!");
      data = {
        grant_type: "authorization_code",
        code: code,
        client_id: authConfig.IS.clientID,
        redirect_uri: redirect_uri,
        scope: "sellerscp"
        // scope: "openid profile email default groups admin"
      };
      headers = {
        'Access-Control-Allow-Origin': '*',
        'Authorization': 'Basic ' + btoa(authConfig.IS.clientID + ':' + authConfig.IS.clientSecret),
      };
      tokenEndpoint = authConfig.IS.tokenEndpoint;
    } else {
      data = {
        grant_type: "authorization_code",
        code: code,
        client_id: authConfig.Auth0.clientID,
        client_secret: authConfig.Auth0.clientSecret,
        redirect_uri: redirect_uri,
      };
      headers = {
        // 'Access-Control-Allow-Origin': '*',
        // scope: "openid profile email default scope1"
      };
      tokenEndpoint = authConfig.Auth0.tokenEndpoint;
    }
    const response = await axios.post(tokenEndpoint, data, {headers});
    console.log("Manual get token END: ");
    console.log(response.data.id_token);
    return response.data;
}

function manualSignOut(token) {
  var url;
  console.log("ID Token Hint: " + token);
  if (authConfig.IS.enabled == true) {
    url = `${authConfig.IS.logoutEndpointURL}?id_token_hint=${token}&post_logout_redirect_uri=${authConfig.IS.signInRedirectURL}`;
  } else {
    const returnUrl = encodeURIComponent(authConfig.IS.signInRedirectURL);
    url = `${authConfig.Auth0.logoutEndpointURL}?returnTo=${returnUrl}&client_id=${authConfig.Auth0.clientID}`;
  }
  console.log(url);
  window.location.href = url;    
}

function testFunction() {
  console.log("Test Function Called")
}

export { manualSignIn, manualGetToken, manualSignOut, testFunction };