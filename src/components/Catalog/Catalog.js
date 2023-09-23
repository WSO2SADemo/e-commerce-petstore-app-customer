import React, { useEffect } from 'react';
import { useState } from 'react';
import { Container, Row, Col, Button, Table } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faThumbsUp as regThumbsUp } from '@fortawesome/free-regular-svg-icons';
import { faThumbsUp as solidThumbsUp } from '@fortawesome/free-solid-svg-icons';
// import { AuthProvider, useAuthContext } from "@asgardeo/auth-react";
import { manualSignIn, manualGetToken, manualSignOut } from '../Authenticator/Auth.js';

import { useCartContext } from '../context/context';
// import PetStoreNav from '../../App.js';
import axios, { isCancel, AxiosError } from 'axios';
import { default as authConfig } from "../../config.json";
import { useAuthContext } from '../context/authContext';
import { parseJwt } from '../util';
import '../../css/popup.css';
console.log("Catelog.js rendered");

// Component to render the item list
const PetItemList = () => {
  const { addToCart } = useCartContext();
  const { handleLogin, handleLogout, handleToken, handleIDToken, isAuthenticated, token, idToken } = useAuthContext();

  const itemPrice = {
    fontSize: '20px',
    fontWeight: 'bold',
    marginRight: '50px'
  };

  const [catalog, setCatalog] = useState([]);
  const [cart, setCartItem] = useState([]);
  const [code, setCode] = useState("");
  const [catalogUpdateToggle, setCatalogUpdateToggle] = useState(false);
  const [isAdmin, setAdmin] = useState(false);
  const [isCustomer, setCustomer] = useState(false);
  const [popupContent, setPopupContent] = useState("");
  const [isPopupVisible, setPopupVisible] = useState(false);
  const [isLogoutState, setIsLogoutState] = useState(false);
  var codeResponse = "";

  const handleOkClick = () => {
    console.log("OK button clicked!");
    // Close the popup
    setPopupVisible(false);
    if (isLogoutState) {
      manualSignOut();
    }
  }

  var gatewayURL;
  useEffect(() => {
    if (authConfig.IS.enabled == true) {
      gatewayURL = authConfig.IS.endpointURL;
      console.log(authConfig.IS.endpointURL);
      console.log(authConfig.IS.tenantDomain);
      if (authConfig.IS.tenantDomain != null) {
        gatewayURL = gatewayURL.replace("{{domain_name}}", authConfig.IS.tenantDomain);
      }
    } else {
      gatewayURL = authConfig.Auth0.endpointURL;
    }
    document.title = "Customer | PetStore";
  }, []);

  useEffect(() => {
    console.log("-- Catalog useEffect[token, catalogUpdateToggle] --");
    console.log(token);
    var scopeURI;
    var scopeAdmin;
    var scopeCustomer;
    if (authConfig.IS.enabled == true) {
      scopeURI = authConfig.IS.scopeURI;
      scopeAdmin = authConfig.IS.scopeAdmin;
      scopeCustomer = authConfig.IS.scopeCustomer;
      gatewayURL = authConfig.IS.endpointURL;
      if (authConfig.IS.tenantDomain != null) {
        gatewayURL = gatewayURL.replace("{{domain_name}}", authConfig.IS.tenantDomain);
      }
    } else {
      scopeURI = authConfig.Auth0.scopeURI;
      scopeAdmin = authConfig.Auth0.scopeAdmin;
      scopeCustomer = authConfig.Auth0.scopeCustomer;
      gatewayURL = authConfig.Auth0.endpointURL;
    }
    if (token && token.length != 0) {
      console.log("ID TOKEN: " + idToken);
      var decodedToken = parseJwt(idToken);
      var scopes = decodedToken[scopeURI];
      console.log(scopes);
      if (scopes.includes(scopeAdmin) || scopes.includes(scopeCustomer)) {
        console.log("SCOPE is Logged in." + scopes)
        console.log("In catalog useEffect for TOKEN");
        console.log("Received token: " + token);
        const url = gatewayURL + '/items?sellerId=-1';
        const headers = {
          'Authorization': 'Bearer ' + token,
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        };
        const fetchCatalogs = async () => {
          const result = await axios.get(url, { headers });
          return result.data;
        };

        try {
          const fetchData = async () => {
            const catData = await fetchCatalogs();
            console.log(catData);
            setCatalog(catData);
            if (catData.length < 1) {
              setPopupVisible(true);
              setIsLogoutState(false);
              setPopupContent("There are no items available to sell at the moment !!");
          }
          };
          fetchData();
          // Work with the response...
        } catch (err) {
          // Handle error
          console.log(err.response.data.description);
          setPopupVisible(true);
          setIsLogoutState(false);
          setPopupContent(err.response.data.description);
        }

        if (scopes.includes("admin")) {
          setAdmin(true);
        } else {
          setAdmin(false);
        }
        if (scopes.includes("customerscp")) {
          setCustomer(true);
        } else {
          setCustomer(false);
        }
      } else {
        console.log("SCOPE ADMIN or CUSTOMER is not in the scope list")
      }
    }
  }, [token, catalogUpdateToggle]);

  useEffect(() => {
    var signInRedirectURL;
    if (authConfig.IS.enabled == true) {
      signInRedirectURL = authConfig.IS.signInRedirectURL;
    } else {
      signInRedirectURL = authConfig.Auth0.signInRedirectURL;
    }
    console.log("In Catalog.js, isAuthenticated: " + JSON.stringify(isAuthenticated));
    const redirectUrl = window.location.href;
    console.log("In catalog useEffect");
    codeResponse = new URL(redirectUrl).searchParams.get("code");
    if (codeResponse != null || code != "") {
      handleLogin();
      setCode(codeResponse);
      console.log("Received code: " + codeResponse);
      console.log("Current token: " + token);
      if (token != "") {
        manualGetToken(codeResponse, signInRedirectURL)
          .then((tokenResponse) => {
            console.log("------------ token in manualGetToken() -------------- ");
            console.log(tokenResponse);
            if (authConfig.IS.enabled == true) {
              handleToken(tokenResponse.access_token);
              handleIDToken(tokenResponse.id_token);
            } else {
              handleToken(tokenResponse.id_token);
              handleIDToken(tokenResponse.id_token);
            }
          })
          .catch((error) => {
            setPopupVisible(true);
            setIsLogoutState(true);
            setPopupContent(error.response.data.description);
        });
      }
    }
  }, []);

  if (!isAuthenticated) {
    return (
      <>
        <Container className="mt-5">
          <h1>Customer</h1>
          <p>You must be logged in to view this page.</p>
          <Button variant="primary" onClick={() => manualSignIn()}>Login</Button>
        </Container>
      </>
    )
  } else {
    return (
      <>
        <Container className="mt-5">
          <Table bordered hover>
            <thead>
              <tr>
                <th scope="col" width="150px">Title</th>
                <th scope="col" width="400px">Description</th>
                <th scope="col">Includes</th>
                <th scope="col">Intended For</th>
                <th scope="col" width="50px">Color</th>
                <th scope="col">Material</th>
                <th scope="col">Price</th>
                <th scope="col">&nbsp;</th>
              </tr>
              {catalog.map(cat => (
                <tr className="align-middle" key={cat.ID}>
                  <td>{cat.Title}</td>
                  <td>{cat.Description}</td>
                  <td>{cat.Includes}</td>
                  <td>{cat.IntendedFor}</td>
                  <td>{cat.Color}</td>
                  <td>{cat.Material}</td>
                  <td>{cat.Price}</td>
                  {!isCustomer ? <td><Button disabled variant="danger" size="sm">Add to cart</Button></td> : <td><Button variant="danger" size="sm" onClick={() => addToCart(cat)}>Add to cart</Button></td>}
                </tr>
              ))}
              {/* <tr className="text-end">
                <td colSpan="8"><Button variant="primary" className="float-right" onClick={handleClick}>Add New Product</Button></td>
              </tr> */}
            </thead>
          </Table>
          {isPopupVisible && (
            <div className="popup">
              <div className="popup-content">
                <h2>Error</h2>
                <p>{popupContent}</p>
                <button onClick={handleOkClick} className="popup-button">OK</button>
                {/* <button onClick={() => setPopupVisible(false)} className="popup-button">Cancel</button> */}
              </div>
            </div>
          )}
        </Container>
      </>
    )
  }

};

export default function Catalog() {
  const [catalog, setCatalog] = useState();
  const [cart, setCartItem] = useState();
  // useEffect(() => {
  //   console.log(cart);
  // }, [cart]);
  useEffect(() => {
    document.title = 'PetStore Catalog';
  }, []); // only when loading
  return (
    <>
      <PetItemList />
    </>
  );
}
