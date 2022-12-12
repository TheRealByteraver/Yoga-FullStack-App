import React, { useContext } from 'react';
import { AuthenticatedUserContext } from './Context';

export default function NotFound(props) {
  const context = useContext(AuthenticatedUserContext);

  return (
    <>
      <div className="actions--bar">
        <div className="wrap">
          <a className="button button-secondary" href="/">Return to List</a>
        </div>
      </div>    
      <div>
        <h2>404 - The page you are looking for does not exist.</h2>
        {
          context.errorMessage.length
            ? <p>Detailed error message: {context.errorMessage}</p>
            : null
        }        
      </div>
    </>
  )
}