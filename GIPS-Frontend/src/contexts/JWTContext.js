import { createContext, useEffect, useReducer } from 'react';
import PropTypes from 'prop-types';
// utils
import axios from '../utils/axios';
import { isValidToken, setSession } from '../utils/jwt';

// ----------------------------------------------------------------------

const initialState = {
  isAuthenticated: false,
  isInitialized: false,
  record: null,
};

const handlers = {
  INITIALIZE: (state, action) => {
    const { isAuthenticated, record } = action.payload;
    return {
      ...state,
      isAuthenticated,
      isInitialized: true,
      record,
    };
  },
  LOGIN: (state, action) => {
    const { record } = action.payload;

    return {
      ...state,
      isAuthenticated: true,
      record,
    };
  },
  LOGOUT: (state) => ({
    ...state,
    isAuthenticated: false,
    record: null,
  }),
  REGISTER: (state, action) => {
    const { record } = action.payload;

    return {
      ...state,
      isAuthenticated: true,
      record,
    };
  },
};

const reducer = (state, action) => (handlers[action.type] ? handlers[action.type](state, action) : state);

const AuthContext = createContext({
  ...initialState,
  method: 'jwt',
  login: () => Promise.resolve(),
  logout: () => Promise.resolve(),
  register: () => Promise.resolve(),
});

// ----------------------------------------------------------------------

AuthProvider.propTypes = {
  children: PropTypes.node,
};

function AuthProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  useEffect(() => {
    const initialize = async () => {
      try {
        const accessToken = window.localStorage.getItem('accessToken');

        if (accessToken && isValidToken(accessToken)) {
          setSession(accessToken);

          // 'https://applications.gips.ac.bw/api/api/v1/users'
          // const response = await axios.get('https://applications.gips.ac.bw/api/api/v1/users');
          const response = await axios.get('/v1/users');
          const { record } = response.data;

          dispatch({
            type: 'INITIALIZE',
            payload: {
              isAuthenticated: true,
              record,
            },
          });
        } else {
          dispatch({
            type: 'INITIALIZE',
            payload: {
              isAuthenticated: false,
              record: null,
            },
          });
        }
      } catch (err) {
        console.error(err);
        dispatch({
          type: 'INITIALIZE',
          payload: {
            isAuthenticated: false,
            record: null,
          },
        });
      }
    };

    initialize();
  }, []);

  const login = async (identity, password) => {
    const response = await axios.post('/v1/users/login', {
      identity,
      password,
    });
    const { token, user } = response.data;

    setSession(token);
    dispatch({
      type: 'LOGIN',
      payload: {
        record: user,
      },
    });
  };

  const register = async (email, password, firstName, lastName) => {
    const response = await axios.post('/v1/users', {
      email,
      password,
      firstName,
      lastName,
    });
    const { token, user } = response.data;

    window.localStorage.setItem('accessToken', token);
    dispatch({
      type: 'REGISTER',
      payload: {
        record: user,
      },
    });
  };

  const logout = async () => {
    setSession(null);
    dispatch({ type: 'LOGOUT' });
  };

  return (
    <AuthContext.Provider
      value={{
        ...state,
        method: 'jwt',
        login,
        logout,
        register,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export { AuthContext, AuthProvider };
