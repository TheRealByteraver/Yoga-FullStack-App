import React, { useState } from 'react';
import Cookies from 'js-cookie';

const apiBaseUrl = 'http://localhost:5000/api';
const cookieName = 'authenticatedUser';

export const AuthenticatedUserContext = React.createContext();

export function Provider(props) {
  /*
    Example of an authenticatedUser object as returned by the api:
    {
      "firstName": "Joe",
      "lastName": "Smith",
      "emailAddress": "joe@smith.com"
    }   
    We will add the password to that object so we can correctly set
    the auth headers for further api calls
  */

  const [errorMessage, setErrorMessage] = useState('');
  const [authenticatedUser, setAuthenticatedUser] = 
    useState(() => {
        const cookie = Cookies.get(cookieName);
        return (cookie ? JSON.parse(cookie) : null);
    });

  // helper function to fetch the api with authorization headers 
  const api = ( 
    path, method = 'GET', body = null, 
    requiresAuth = false, credentials = null) => {

    // reset the applications' global error message:
    setErrorMessage('');
    
    const url = (process.env.REACT_APP_COURSES_API_URL || apiBaseUrl) + path;
    const options = {
      method,
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
      },
    };
    if (body !== null) {
      options.body = JSON.stringify(body);
    }
    if (requiresAuth) {
      // btoa does base64 encoding which is required for an auth header
      const encodedCredentials = btoa(
        `${credentials.emailAddress}:${credentials.password}`); 
      // add the auth header  
      options.headers['Authorization'] = `Basic ${encodedCredentials}`;
    }
    console.log(
      'Fetching the url ', url, 
      ', requiresAuth is ', requiresAuth,
      ', with method ', options.method,
      ', with body ', options.body,
      ', with headers: ', options.headers);    
    return fetch(url, options);
  }  

  // helper function to fetch a user using the above api() function
  const getUser = async (emailAddress, password) => {
    const response = await api(
      `/users`, 'GET', null, true, { emailAddress, password });
    if (response.status === 200) {
      let authUser = await response.json();
      authUser = {
        ...authUser,
        password  // save password for further api calls
      };
      console.log('authUser as returned by getUser() will be: ', authUser);
      return authUser;
    }
    else if (response.status === 401) {
      return null;
    }
    else {
      throw new Error('Error occured during fetch of /users');
    }
  }  

  const signIn = async (emailAddress, password) => {
    console.log('calling getUser(', emailAddress, ', ', password, ')');
    const user = await getUser(emailAddress, password);
    if (user !== null) {
      setAuthenticatedUser(() => user);
      // Set cookie that will expire after 1 day:
      // docs at https://github.com/js-cookie/js-cookie#expires
      console.log('We will save the following cookie: ', JSON.stringify(user));
      Cookies.set(cookieName, JSON.stringify(user), { expires: 1 });
    }
    console.log('SignIn() returned the user ', user);
    return user; 
  }

  // Function to sign out a user
  const signOut = () => {
    console.log('Signing out user ', authenticatedUser);
    setAuthenticatedUser(() => {       
      return null
    });
    Cookies.remove(cookieName);
  }

  return (
    <AuthenticatedUserContext.Provider value={{
        errorMessage,
        authenticatedUser,
        actions: {
          api,
          signIn,
          signOut,
          setErrorMessage
        } 
      }
    }>
      { props.children }
    </AuthenticatedUserContext.Provider>
  );
};

export const Consumer = AuthenticatedUserContext.Consumer;