import React, { useContext } from 'react';
import { AuthenticatedUserContext } from './Context';

export default function UnhandledError(props) {
  const context = useContext(AuthenticatedUserContext);

  return (
    <>
      <div className="actions--bar">
        <div className="wrap">
          <a className="button button-secondary" href="/">Return to List</a>
        </div>
      </div>    
      <div>
        <h2>Error: a fatal error occured, your request could not be handled.</h2>
        {
          context.errorMessage.length
            ? <p>Detailed error message: {context.errorMessage}</p>
            : null
        }
      </div>
    </>
  )
}