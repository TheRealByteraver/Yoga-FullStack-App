import React, { useContext } from 'react';
import { AuthenticatedUserContext } from './Context';
import {
  Route,
  Redirect,
} from 'react-router-dom';

export default function PrivateRoute({ children, ...rest }) {

  const { authenticatedUser } = useContext(AuthenticatedUserContext); 

  return (
    <Route
      {...rest}
      render={ props => authenticatedUser //context.authenticatedUser 
        ? children
        : <Redirect to={{
            pathname: "/signin",
            state: { from: props.location }
          }} />
      }
    />
  );
}

// import React from 'react';
// import { Route, Redirect } from 'react-router-dom';
// import { Consumer } from './Context';

// export default ({ component: Component, ...rest }) => {
//   return (
//     <Consumer>
//       {context => (
//         <Route
//           {...rest}
//           render={props => context.authenticatedUser ? (
//               <Component {...props} />
//             ) : (
//               <Redirect to={{
//                 pathname: '/signin',
//                 state: { from: props.location }
//               }} />
//             )
//           }
//         />
//     )}
//     </Consumer>
//   );
// };