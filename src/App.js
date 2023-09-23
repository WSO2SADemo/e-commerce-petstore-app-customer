// import logo from './logo.svg';
import React, { useEffect, useState } from 'react';
import './App.css';
import './App.scss';
import { Nav, Navbar, Container } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser } from '@fortawesome/free-solid-svg-icons';
import { BrowserRouter, Switch, Route, Link } from 'react-router-dom';
// import { AuthProvider, useAuthContext } from "@asgardeo/auth-react";
import { default as authConfig } from "./config.json";
import { Provider } from './components/context/context';
import { AuthProvider, useAuthContext } from './components/context/authContext';


import Catalog from './components/Catalog/Catalog.js';
import MyCart from './components/MyCart/Cart.js';
import { manualSignIn, manualGetToken, manualSignOut, testFunction } from './components/Authenticator/Auth.js';
import User from './components/User/user';

// Component to render the login/signup/logout menu


const RightLoginSignupMenu = () => {
  // Based on Asgardeo SDK, set a variable like below to check and conditionally render the menu
  let isLoggedIn = false;
  const { isAuthenticated, token } = useAuthContext();
  const { handleLogin, handleLogout, handleToken, authState } = useAuthContext();
  // Host the menu content and return it at the end of the function
  let menu;
 
  // const {
  //   state,
  //   signIn,
  //   signOut,
  //   getBasicUserInfo,
  //   getIDToken,
  //   getDecodedIDToken,
  //   on,
  //   getAccessToken
  // } = useAuthContext();

  // Conditionally render the following two links based on whether the user is logged in or not
  // if (false) {
  console.log("In App.js, isAuthenticated: " + isAuthenticated);
  if (isAuthenticated) {
    menu = <>
      <Nav>
        <Nav.Link onClick={() => manualSignOut(token)}>Logout</Nav.Link>
        <Nav.Link href="/user" onClick={() => testFunction()}><FontAwesomeIcon icon={faUser} /></Nav.Link></Nav>
    </>
  } else {
    menu = <>
      <Nav>
        {/* <Nav.Link onClick={() => signIn()} >Login</Nav.Link> */}
        <Nav.Link onClick={() => manualSignIn()} >Login</Nav.Link>
        <Nav.Link href="#deets">Sign Up</Nav.Link></Nav>
    </>
  }
  return menu;
}

// Component to render the navigation bar
const PetStoreNav = () => {
  return (
    <>
      <Navbar bg="light" expand="lg">
        <Container>
          <Navbar.Brand href="#home">PetStore</Navbar.Brand>
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Link to={"/catalog"}>Catalog</Link>
          <Link to={"/mycart"}>My Cart</Link>
          <Link to={"/user"}>My Account</Link>
          <RightLoginSignupMenu isLoggedIn />
        </Container>
      </Navbar>
    </>
  );
};

// Main app component
const App = () => {
  return (
    <>
      {/* <AuthProvider config={authConfig}> */}
      <AuthProvider>
        <Provider>
            <BrowserRouter>
              <PetStoreNav />
              <Switch>
                <Route path="/catalog">
                  <Catalog />
                </Route>
                <Route path="/mycart">
                  <MyCart />
                </Route>
                <Route path="/user">
                  <User />
                </Route>
              </Switch>
            </BrowserRouter>
          </Provider>
      </AuthProvider>
    </>
  );
}

export default App;

