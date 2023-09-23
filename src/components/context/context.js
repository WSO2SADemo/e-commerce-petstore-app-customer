import React from 'react';

const reducer = (state, action) => {
    switch (action.type) {
        case 'ADD_TO_CART':
            action.payload.qty = 1;
            return {
                ...state, // take old state and apply new state
                cart: [...state.cart, action.payload] // add new item to cart variable in the same state
            }
        case 'CLEAR_CART':
            return {
                ...state, // take old state and apply new state
                cart: [] // add new item to cart variable in the same state
            }
        case 'UPDATE_CART':
            // iterate and update the cart item
            // state.cart.name = "desilva";
            return {
                ...state, // take old state and apply new state
                cart: [...state.cart, action.payload] // add new item to cart variable in the same state
            }
        case 'UPDATE_ITEM_QTY': 
            const item = state.cart.find(item => item.ID === action.payload.id);
            if (item) item.qty = action.payload.qty;
            return state;
        default:
            return state;
    }
}

const addToCart = (dispatch) => {
    return (payload) => {
        dispatch({ type: 'ADD_TO_CART', payload });
    };
}

const uptateItemQty = (dispatch) => {
    return (payload) => {
        dispatch({ type: 'UPDATE_ITEM_QTY', payload });
    };
}

const updateCartItem = (dispatch) => {
    return (payload) => {
        dispatch({ type: 'UPDATE_CART', payload });
    };
}

const clearCart = (dispatch) => {
    return () => {
        dispatch({ type: 'CLEAR_CART' });
    };
}

export const Context = React.createContext({});

export const Provider = (props) => {
    console.log('CartProvider initiated.')
    const [state, dispatch] = React.useReducer(reducer, { cart: []});
    const actions = { addToCart: addToCart(dispatch), uptateItemQty: uptateItemQty(dispatch), clearCart: clearCart(dispatch) };
    return (
        <Context.Provider value={{ ...state, ...actions }}>
            {props.children}
        </Context.Provider>
    )
}

export const useCartContext = () => React.useContext(Context);
