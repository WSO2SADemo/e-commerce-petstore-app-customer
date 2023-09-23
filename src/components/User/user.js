import React, { useEffect } from 'react';
import { useState } from 'react';
import { Container, Row, Col, Button, Table } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faThumbsUp as regThumbsUp } from '@fortawesome/free-regular-svg-icons';
import { faThumbsUp as solidThumbsUp } from '@fortawesome/free-solid-svg-icons';
// import { AuthProvider, useAuthContext } from "@asgardeo/auth-react";
import { manualSignIn, manualGetToken } from '../Authenticator/Auth.js';
import { useCartContext } from '../context/context';
// import PetStoreNav from '../../App.js';
import axios, { isCancel, AxiosError } from 'axios';
import { default as authConfig } from "../../config.json";
import { useAuthContext } from '../context/authContext';
import { parseJwt } from '../util';
console.log("Catelog.js rendered");

// Component to render the item list
const UserInfo = () => {
  const { addToCart } = useCartContext();
  const { handleLogin, handleLogout, handleToken, handleIDToken, isAuthenticated, token, idToken } = useAuthContext();
  const itemPrice = {
    fontSize: '20px',
    fontWeight: 'bold',
    marginRight: '50px'
  };
  console.log("Initializing User !!");
  const [catalog, setCatalog] = useState([]); 
  const [cart, setCartItem] = useState([]);
  const [code, setCode] = useState(""); 
  const gatewayURL = authConfig.endpointURL;
  const [catalogUpdateToggle, setCatalogUpdateToggle] = useState(false); 
  const [isAdmin, setAdmin] = useState(false);
  const [isCustomer, setCustomer] = useState(false);
  var codeResponse = "";

  const [scopes, setScopes] = useState([]); 
  const [givenName, setGivenName] = useState([]); 
  const [groups, setGroups] = useState([]); 
  const [family_name, setFirstName] = useState([]); 
  const [email, setEmail] = useState([]); 
  const [country, setCountry] = useState([]); 
  var address;

  const editUserDetails = () => {

  }


  useEffect(() => {
    var scopeAdmin = authConfig.IS.copeAdmin;
    var scopeCustomer = authConfig.Auth0.scopeCustomer;
    console.log("In User effect: " + isAuthenticated);
    console.log("token: " + token);
    console.log("idToken: " + idToken);
    var decodedToken = parseJwt(idToken);
    if (isAuthenticated && idToken) {
      console.log("isAuthenticated && idToken: ");
      var tempScopes = decodedToken[authConfig.IS.scopeURI];
      console.log(tempScopes);
      if (authConfig.IS.enabled == true) {
        scopeAdmin = authConfig.IS.scopeAdmin;
        scopeCustomer = authConfig.IS.scopeCustomer;
        setScopes(tempScopes);
        setGivenName(decodedToken[authConfig.IS.givenName]);
        setGroups(decodedToken[authConfig.IS.groups]);
        setFirstName(decodedToken[authConfig.IS.family_name]);
        setEmail(decodedToken[authConfig.IS.email]);
        address = decodedToken[authConfig.IS.address];
        setCountry(address.country);
        if (tempScopes.includes(scopeCustomer)) {
            setCustomer(true);
        } else {
            setCustomer(false);
        }
        console.log(scopes + "-" + givenName + "-" + groups + "-" + family_name + "-" + email + "-" + country + " - isCustomer: " + isCustomer);
      } else {
        var metadata = decodedToken["metadata"];
        console.log(metadata);
        setScopes(decodedToken[authConfig.Auth0.scopeURI]);
        setGivenName(metadata[authConfig.Auth0.givenName]);
        setGroups(decodedToken[authConfig.Auth0.groups]);
        setFirstName(metadata[authConfig.Auth0.family_name]);
        setEmail(decodedToken[authConfig.Auth0.email]);
        address = metadata[authConfig.Auth0.address];
        
        setCountry(address.country);
        console.log(scopes + "-" + givenName + "-" + groups + "-" + family_name + "-" + email + "-" + country);
        console.log(country);
      }
    } else {
        console.log("!!!! isAuthenticated && idToken: ");
    }
    
  }, [isAuthenticated]);

  if (!isAuthenticated) {
    return (
      <>
        <Container className="mt-5">
          <h1>User</h1>
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
                <th scope="col" width="150px">Username</th>
                <th scope="col" width="150px">First Name</th>
                <th scope="col" width="400px">Last Name</th>
                <th scope="col">Address</th>
                <th scope="col">Type</th>
                <th scope="col">Email</th>
              </tr>
              <tr className="align-middle">
                  <td>{email}</td>
                  <td>{givenName}</td>
                  <td>{family_name}</td>
                  <td>{country}</td>
                  <td>{groups}</td>
                  <td>{email}</td>
                  {!isCustomer ?<td><Button disabled variant="danger" size="sm">Editing for Admins Only</Button></td> : <td><Button variant="danger" size="sm" onClick={() => editUserDetails()}>Edit Using SCIM 2.0</Button></td>}
                </tr>
              {/* <tr className="text-end">
                <td colSpan="8"><Button variant="primary" className="float-right" onClick={handleClick}>Add New Product</Button></td>
              </tr> */}
            </thead>
          </Table>
        </Container>
      </>
    )
  }

};

export default function User() {
  const [catalog, setCatalog] = useState(); 
  const [cart, setCartItem] = useState();
  // useEffect(() => {
  //   console.log(cart);
  // }, [cart]);
  useEffect(() => {
    document.title = 'PetStore User';
  }, []); // only when loading
  return (
    <>
      <UserInfo />
    </>
  );
}
