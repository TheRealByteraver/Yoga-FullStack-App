import React, { useState, useContext } from 'react';
import { AuthenticatedUserContext } from './Context';
import Form from './Form';
import { Link } from 'react-router-dom';

// UserSignIn - This component provides the 'Sign In' screen by rendering 
// a form that allows a user to sign in using their existing account 
// information. The component also renders a 'Sign In' button that when 
// clicked signs in the user and a 'Cancel' button that returns the user 
// to the default route (i.e. the list of courses).

export default function UserSignIn(props) {

  const context = useContext(AuthenticatedUserContext);

  const [signInState, setSignInState] = useState({
    emailAddress: '',
    password: '',
    errors: []
  });  

  function change(event) {
    const name = event.target.name;
    const value = event.target.value;

    setSignInState((prevState) => {
      return {
        ...prevState,
        [name]: value
      };
    });
  }        

  function handleCancel() {
    props.history.push('/');
  }

  function handleSubmit() {
    console.log('trying to sign in: ', signInState.emailAddress, ':', signInState.password);

    const { from } = props.location.state || { from: { pathname: '/' } };

    context.actions.signIn(signInState.emailAddress, signInState.password)
      .then((user) => {
        if (user === null) {
          setSignInState((prevState) => {
            return { 
              ...prevState,
              errors: [ 'Sign-in was unsuccessful' ] 
            };
          });
        } else {
          props.history.push(from);
        }
      })
      .catch((error) => {
        console.error(error);
        props.history.push('/error');
      });
  }

  return (
    <main>
      <div className='form--centered'>
        <h2>Sign In</h2>       
        <Form 
          cancel={handleCancel}
          errors={signInState.errors}
          submit={handleSubmit}
          submitButtonText='Sign In'
          elements={() => (
            <React.Fragment>
              <label htmlFor='emailAddress'>Email Address</label>
              <input 
                id='emailAddress' 
                name='emailAddress' 
                type='email'
                autoComplete='email'
                value={signInState.emailAddress} 
                onChange={change} 
                placeholder='email address' 
              />
              <label htmlFor='password'>Password</label>                      
              <input 
                id='password' 
                name='password'
                type='password'
                autoComplete='current-password'
                value={signInState.password} 
                onChange={change} 
                placeholder='Password' 
              />                
            </React.Fragment>
          )} />
        <p>Don't have a user account? <Link to='/signup'>Click here</Link> to sign up!</p>
      </div>
    </main>
  );     
}