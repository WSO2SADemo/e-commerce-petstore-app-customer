import React from 'react';

const authState = {
    isAuthenticated: false,
    token: null,
    idToken: null
  };

const reducer = (state, action) => {
    switch (action.type) {
        case 'LOGIN':
            return {
                ...state,
                isAuthenticated: true
            };
        case 'LOGOUT':
            return {
                ...state,
                isAuthenticated: false,
                user: null,
            };
        case 'TOKEN':
            console.log("TOKEN DISPATCH")
            console.log(action.payload)
            return {
                ...state,
                token: action.payload,
            };
        case 'IDTOKEN':
            console.log("ID TOKEN DISPATCH")
            console.log(action.payload)
            return {
                ...state,
                idToken: action.payload,
            };
        default:
        return state;
    }
};

const handleLogin = (dispatch) => {
    return () => {
        dispatch({ type: 'LOGIN' });
    };
}

const handleLogout = (dispatch) => {
    return () => {
        dispatch({ type: 'LOGOUT' });
    };
}

const handleToken = (dispatch) => {
    return (payload) => {
        dispatch({ type: 'TOKEN', payload });
    };
}

const handleIDToken = (dispatch) => {
    return (payload) => {
        dispatch({ type: 'IDTOKEN', payload });
    };
}

export const Context = React.createContext({});

export const AuthProvider = (props) => {
    console.log('AuthProvider initiated.' + JSON.stringify(authState))
    const [state, dispatch] = React.useReducer(reducer, authState);
    const actions = { handleLogin: handleLogin(dispatch), handleLogout: handleLogout(dispatch), handleToken: handleToken(dispatch), handleIDToken: handleIDToken(dispatch) };
    return (
        <Context.Provider value={{ ...state, ...actions }}>
            {props.children}
        </Context.Provider>
    )
}

export const useAuthContext = () => React.useContext(Context);
