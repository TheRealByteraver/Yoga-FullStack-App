import React, { useContext } from 'react';
import { AuthenticatedUserContext } from './Context';

export default function Forbidden(props) {
  const context = useContext(AuthenticatedUserContext);

  return (
    <>
      <div className="actions--bar">
        <div className="wrap">
          <a className="button button-secondary" href="/">Return to List</a>
        </div>
      </div>    
      <div>
        <h2>Forbidden - you do not have access to the requested resource.</h2>
        {
          context.errorMessage.length
            ? <p>Detailed error message: {context.errorMessage}</p>
            : null
        }
      </div>
    </>
  )
}