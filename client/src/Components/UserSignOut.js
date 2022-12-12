import React, { useEffect, useContext } from 'react';
import { AuthenticatedUserContext } from './Context';
import { Redirect } from 'react-router-dom';

export default function UserSignOut() {  
  // We need to use a context hook here as React does not allow us to change 
  // state inside a return statement of a functional component or a render
  // function of a class component.
  const context = useContext(AuthenticatedUserContext); 
  useEffect(() => context.actions.signOut());

  return ( <Redirect to="/" /> );
}