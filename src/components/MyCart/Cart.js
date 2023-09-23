import React, { useEffect } from 'react';
import { Button, Col, Container, Form, FormLabel, Row, Table } from 'react-bootstrap';
import { InputNumber, InputGroup } from 'rsuite';
import '../../App.js';
import '../../index.css';
import { useCartContext } from '../context/context';
import { default as authConfig } from "../../config.json";
import { useAuthContext } from '../context/authContext';
import { manualSignOut } from '../Authenticator/Auth.js';
import { useState } from 'react';
import { parseJwt } from '../util';
import axios, { isCancel, AxiosError } from 'axios';
import './inputnumber.less';

export default function MyCart() {

    const { cart, uptateItemQty, clearCart } = useCartContext();
    const { handleLogin, handleLogout, handleToken, handleIDToken, isAuthenticated, token, idToken } = useAuthContext();
    const [deliveryStatuses, setDeliveryStatuses] = useState([]);
    const [code, setCode] = useState("");
    const [catalogUpdateToggle, setCatalogUpdateToggle] = useState(false);
    const [isAdmin, setAdmin] = useState(false);
    const [isCustomer, setCustomer] = useState(false);
    const [scopeURI, setScopeURI] = useState(false);
    const [scopeAdmin, setScopeAdmin] = useState(false);
    const [scopeCustomer, setScopeCustomer] = useState();
    const [gatewayURL, setGatewayURL] = useState();
    const [email, setEmail] = useState();
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

    useEffect(() => {
        console.log("-- Catalog useEffect[] --");
        console.log("TOKEN: " + token);
        console.log("ID TOKEN: " + idToken);
        if (authConfig.IS.enabled == true) {
            console.log(authConfig.IS.scopeURI)
            setScopeURI(authConfig.IS.scopeURI);
            setScopeAdmin(authConfig.IS.scopeAdmin);
            setScopeCustomer(authConfig.IS.scopeCustomer);
            var tempGatewayURL = authConfig.IS.endpointURL;
            if (authConfig.IS.tenantDomain != null) {
                setGatewayURL(tempGatewayURL.replace("{{domain_name}}", authConfig.IS.tenantDomain));
            }
        } else {
            setScopeURI(authConfig.Auth0.scopeURI);
            setAdmin(authConfig.Auth0.scopeAdmin);
            setScopeCustomer(authConfig.Auth0.scopeCustomer);
            setGatewayURL(authConfig.Auth0.endpointURL);
        }
        document.title = "Customer | My Cart";
    }, []);

    useEffect(() => {
        console.log("-- Catalog useEffect[token, catalogUpdateToggle] --");
        if (idToken) {
            var decodedToken = parseJwt(idToken);
            setEmail(decodedToken["email"])
        }
    }, [token, catalogUpdateToggle]);

    useEffect(() => {
        if (idToken && token && scopeURI) {
            getDeliveryStatus();
        }
    }, [gatewayURL, scopeURI]);

    // State to keep track of the number of items in the cart
    const [value, setValue] = React.useState(1);
    const [subTotal, setSubTotal] = React.useState(0);
    const handleMinus = () => {
        setValue(parseInt(value, 10) - 1);
    };
    const handlePlus = () => {
        setValue(parseInt(value, 10) + 1);
    };

    const rows = cart.map(cartItem => {
        console.log("adding to rows !!: " + cartItem.ID);
        const handleQtyIncrease = () => {
            uptateItemQty({
                id: cartItem.ID,
                qty: cartItem.qty + 1
            })
            setValue(parseInt(value, 10) + 1);
            const total = cartItem.Price * cartItem.qty
            setSubTotal(subTotal + total)
        }
        const handleQtyChange = (e) => {
            if (e <= 0) {
                e = 1
            }
            uptateItemQty({
                id: cartItem.ID,
                qty: e
            })
            const total = cartItem.Price * cartItem.qty
            setSubTotal(subTotal + total)
        }

        const handleQtyDecrease = () => {
            if (cartItem.qty === 1) {
                uptateItemQty({
                    id: cartItem.ID,
                    qty: cartItem.qty
                })

            } else {
                uptateItemQty({
                    id: cartItem.ID,
                    qty: cartItem.qty - 1
                })
            }
            const total = cartItem.Price * cartItem.qty
            setSubTotal(subTotal + total)
        }

        return (
            <tr key={cartItem.ID} id={cartItem.ID}>
                <td>{cartItem.Title}</td>
                <td width="120px">
                    <InputGroup>
                        <InputGroup.Button onClick={handleQtyDecrease} >-</InputGroup.Button>
                        <input type='number' className={'custom-input-number'} value={cartItem.qty} onChange={handleQtyChange} />
                        <InputGroup.Button onClick={handleQtyIncrease}>+</InputGroup.Button>
                    </InputGroup>
                </td>
                <td width="120px" className="text-center">{cartItem.Price}</td>
                <td width="120px" className="text-center">{`$ ${cartItem.Price * cartItem.qty}`}</td>
                {console.log(cartItem)}
            </tr>
        )
    })

    const cancelPurchaseOrder = (purchaseId) => {
        console.log(purchaseId);
        var url = gatewayURL + '/cancelPurchase?idstring=' + purchaseId;
        var headers = {
            'Authorization': 'Bearer ' + token,
            'Content-Type': 'application/json',
            // 'Access-Control-Allow-Origin': '*'
        };
        try {
            const cancelPurchase = async () => {
                console.log("Cancel purchase")
                const result = await axios.delete(url, { headers: headers });
                console.log("Purchase calcelled")
                getDeliveryStatus();
                return result.data;
            };
            cancelPurchase();
            // Work with the response...
          } catch (err) {
            // Handle error
            console.log(err.response.data.description);
            setPopupVisible(true);
            setPopupContent(err.response.data.description);
          }
        
        
    }


    const getDeliveryStatus = (newid) => {
        console.log("-- getDeliveryStatus() -- for " + email);
        if (token && token.length != 0) {
            console.log("ID TOKEN: " + idToken);
            var decodedToken = parseJwt(idToken);
            var scopes = decodedToken[scopeURI];
            console.log(scopes);
            console.log(scopeCustomer)
            if (scopes.includes(scopeCustomer)) {
                try {
                    const url = gatewayURL + '/purchaseItems?id=' + email;
                    const headers = {
                        'Authorization': 'Bearer ' + token,
                        'Content-Type': 'application/json',
                    };
                    const fetchDeliveryStatuses = async () => {
                        const result = await axios.get(url, { headers });
                        return result.data;
                    };
                    const fetchData = async () => {
                        const deliveryData = await fetchDeliveryStatuses();
                        console.log(deliveryData);
                        setDeliveryStatuses(deliveryData);
                    };
                    fetchData();
                    // Work with the response...
                  } catch (err) {
                    // Handle error
                    console.log(err.response.data.description);
                    setPopupVisible(true);
                    setPopupContent(err.response.data.description);
                  }
                
                
            } else {
                console.log("CUSTOMER is not in the scope list")
            }
        }
    }

    const handleSubmit = (event) => {
        event.preventDefault();
        clearCart();
        console.log("HANDLE SUBMIT !!");
        const tableBody = document.getElementById("checkouttablebody");
        const rows = tableBody.querySelectorAll("tr");
        var itemArray = [];
        for (let i = 0; i < rows.length; i++) {
            const row = rows[i];
            const cells = row.querySelectorAll("td");
            // console.log(cells[1].getElementsByClassName("custom-input-number")[0].value);
            var itemObject = {
                "id": parseInt(row.id),
                "name": cells[0].innerHTML,
                "quantity": parseInt(cells[1].getElementsByClassName("custom-input-number")[0].value),
                "unitPrice": parseFloat(cells[2].innerHTML.replace("$ ", "")),
                "total": parseFloat(cells[3].innerHTML.replace("$ ", "")),
            };
            itemArray.push(itemObject);
        }
        if (rows.length > 0) {
            console.log(itemArray);
            const orderPlacement = {
                "itemList": itemArray,
                "fullName": document.getElementById("fullname-id").value,
                "cardnumber": parseInt(document.getElementById("cardnumber-id").value),
                "expirationdate": document.getElementById("expirationdate-id").value,
                "cvv": parseInt(document.getElementById("cvv-id").value),
                "subtotal": parseFloat(document.getElementById("subtotal-id").innerHTML.replace("$ ", "")),
                "shipping": parseFloat(document.getElementById("shipping-id").innerHTML.replace("$ ", "")),
                "tax": parseFloat(document.getElementById("tax-id").innerHTML.replace("$ ", "")),
                "total": parseFloat(document.getElementById("total-id").innerHTML.replace("$ ", "")),
                "username": email
            };

            console.log(document.getElementById("total-id").innerHTML.replace("$ ", ""))
            if (token && token.length != 0) {
                var decodedToken = parseJwt(idToken);
                var scopes = decodedToken[scopeURI];
                console.log(scopes);
                console.log(scopeCustomer);
                if (scopes.includes(scopeCustomer)) {
                    const url = gatewayURL + '/purchaseItems';
                    const headers = {
                        'Authorization': 'Bearer ' + token,
                        'Content-Type': 'application/json'
                        // 'Access-Control-Allow-Origin': '*'
                    };
                    console.log(orderPlacement);
                    console.log(authConfig.IS.endpointURL);
                    console.log(authConfig.IS.tenantDomain);
                    console.log(url);
                    try {
                        const purchaseConfirm = async () => {
                            console.log("lalala");
                            const result = await axios.post(url, orderPlacement, { headers });
                            console.log(result.data);
                            itemArray = [];
                            document.getElementById("fullname-id").value = "";
                            document.getElementById("cardnumber-id").value = "";
                            document.getElementById("expirationdate-id").value = "";
                            document.getElementById("cvv-id").value = "";
                            // document.getElementById("subtotal-id").innerHTML = "";
                            // document.getElementById("shipping-id").innerHTML = "";
                            // document.getElementById("tax-id").innerHTML = "";
                            // document.getElementById("total-id").innerHTML = "";
                            getDeliveryStatus();
                            return result.data;
                        };
                        purchaseConfirm();
                        // Work with the response...
                      } catch (err) {
                        // Handle error
                        console.log(err.response.data.description);
                        setPopupVisible(true);
                        setPopupContent(err.response.data.description);
                      }
                    
                    
                } else {
                    console.log("CUSTOMER is not in the scope list")
                }
            }
        } else {
            console.log("No items to place an order")
        }
    };




    // Number of items in the cart
    let numItems = cart.reduce((acc, curr) => acc + curr.qty, 0);
    let cartPrice = cart.reduce((acc, curr) => acc + curr.qty * curr.Price, 0);
    // onClick={() => placeOrder()}
    return (
        <>
            <Container className="mt-5">
                <Row>
                    <Col>
                        <p>Checking out items - You have {numItems} items in your cart</p>
                        <table className='table align-middle'>
                            <thead>
                                <tr className="text-center">
                                    <th scope="col"></th>
                                    <th scope="col">QTY</th>
                                    <th scope="col" >Unit</th>
                                    <th scope="col">Total</th>
                                </tr>
                            </thead>
                            <tbody id="checkouttablebody">
                                {rows}
                            </tbody>
                        </table>
                    </Col>
                    <Col className="col-4 bg-primary p-4 text-white rounded-3"><h2>Card Details</h2>
                        <Form onSubmit={handleSubmit}>
                            <Row>
                                <Form.Group className="mb-3" controlId="formNameOnCard">
                                    <FormLabel>Name on Card</FormLabel>
                                    <Form.Control id="fullname-id" type="text" placeholder="Enter full name" />
                                </Form.Group>
                                <Form.Group className="mb-3" controlId="formCardNumber">
                                    <FormLabel>Card Number</FormLabel>
                                    <Form.Control id="cardnumber-id" type="text" placeholder="Enter card number" />
                                </Form.Group>
                            </Row>
                            <Row><Col>
                                <Form.Group className="mb-3" controlId="formExpirationDate">
                                    <FormLabel>Expiration Date</FormLabel>
                                    <Form.Control id="expirationdate-id" type="text" placeholder="Expiration Date" />
                                </Form.Group></Col>
                                <Col>
                                    <Form.Group className="mb-3" controlId="formCVV">
                                        <FormLabel>CVV</FormLabel>
                                        <Form.Control id="cvv-id" type="text" placeholder="CVV" />
                                    </Form.Group></Col>
                            </Row>
                            <Row className="p-1">
                                <Col>Subtotal</Col>
                                <Col id="subtotal-id" className="col-2 d-flex justify-content-right">{`$ ${(cartPrice).toFixed(2)}`}</Col>
                            </Row>
                            <Row className="p-1">
                                <Col>Shipping</Col>
                                <Col id="shipping-id" className="col-2 d-flex justify-content-right">{`$ ${(cartPrice * 1 / 100).toFixed(2)}`}</Col>
                            </Row>
                            <Row className="p-1">
                                <Col c>Tax</Col>
                                <Col id="tax-id" className="col-2 d-flex justify-content-right">{`$ ${(cartPrice * 10 / 100).toFixed(2)}`}</Col>
                            </Row>

                            <Row className="p-1">
                                <Col>Total (inc. tax)</Col>
                                <Col id="total-id" className="col-2 d-flex justify-content-right">
                                    {`$ ${(cartPrice + cartPrice * 10 / 100 + cartPrice * 1 / 100).toFixed(2)}`}</Col>
                            </Row>
                            <Row className="d-flex justify-content-center p-3">
                                <Button variant="warning" type="submit" size="lg">
                                    Place Order
                                </Button>
                            </Row>
                        </Form>
                    </Col>
                </Row>
                <Row>
                    <Table bordered hover>
                        <thead>
                            <tr>
                                <th scope="col" width="50px">OrderId</th>
                                <th scope="col">Total</th>
                                <th scope="col">Delivery Status</th>
                                <th scope="col">Cancel Order</th>
                            </tr>
                        </thead>
                        <tbody>
                            {deliveryStatuses.map(deliveryRecord => (
                                <tr className="align-middle" key={deliveryRecord.id}>
                                    <td>{deliveryRecord.id}</td>
                                    <td>{deliveryRecord.total}</td>
                                    <td>
                                        <Table bordered hover>
                                            <thead>
                                                <tr>
                                                    <th scope="col" width="100px">name</th>
                                                    <th scope="col" width="100px">quantity</th>
                                                    <th scope="col" width="100px">unit price</th>
                                                    <th scope="col" width="100px">total</th>
                                                    <th scope="col" width="100px">delivered</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {deliveryRecord.purchaseItems.map(purchaseItem => (
                                                    <tr className="align-middle" key={deliveryRecord.id + "_inner"}>
                                                        <td>{purchaseItem.name}</td>
                                                        <td>{purchaseItem.quantity}</td>
                                                        <td>{purchaseItem.unitPrice}</td>
                                                        <td>{purchaseItem.total}</td>
                                                        {!purchaseItem.delivered == 1 ? <td><Button disabled variant="danger" size="sm">Not Shipped</Button></td> : <td><Button disabled variant="success" size="sm" >Shipped</Button></td>}
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </Table>
                                    </td>
                                    <td>
                                        <Button variant="danger" onClick={() => cancelPurchaseOrder(deliveryRecord.id)}>Cancel</Button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </Table>
                </Row>
            </Container>
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
        </>
    );
}

//onClick={() => addToCart(cat)}