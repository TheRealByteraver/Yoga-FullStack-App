import React, { useContext, useState } from 'react';
import { AuthenticatedUserContext } from './Context';
import { Link } from 'react-router-dom';
import Form from './Form';

// UserSignUp - This component provides the 'Sign Up' screen by rendering 
// a form that allows a user to sign up by creating a new account. The 
// component also renders a 'Sign Up' button that when clicked sends a POST 
// request to the REST API's /api/users route and signs in the user. This 
// component also renders a 'Cancel' button that returns the user to the 
// default route (i.e. the list of courses).

export default function UserSignUp(props) {

  const context = useContext(AuthenticatedUserContext);

  const [signUpState, setSignUpState] = useState({
    firstName: '',
    lastName: '',
    emailAddress: '',
    passwordValidate: '',
    password: '',
    dateOfBirth: new Date(1980, 1, 1).toISOString().slice(0, 10),
    errors: []
  });  

  function change(event) {
    const name = event.target.name;
    const value = event.target.value;

    setSignUpState(prevState => {
      return {
        ...prevState,
        [name]: value
      };
    });
  }        

  function handleCancel() {
    props.history.push('/');
  }
  
  async function signUp() {
    
    console.log('trying to sign up: ', signUpState);
    const response = await context.actions.api('/users', 'POST', signUpState, false, null);
    console.log('http response was: ', response.status);
    if (response.status === 201) {
      // immediately sign in the user that just signed up
      console.log('Trying to sign in newly created user ',
        signUpState.emailAddress, ' with password ', signUpState.password);

      context.actions.signIn(signUpState.emailAddress, signUpState.password)
        .then((user) => {
          if (user === null) {
            setSignUpState(prevState => ({
                ...prevState, errors: [ 'Sign-in was unsuccessful' ] }));
          } else {
            setSignUpState(prevState => ({ ...prevState, errors: [] }));
            props.history.push('/');
          }
        })
        .catch((error) => {
          console.log('Error occured during signin of newly created user: ', error);
          props.history.push('/error');
        });
    }
    else if (response.status === 400) {
      const { errors } = await response.json();
      console.log('Validation error during sign Up: ', errors);
      setSignUpState(prevState => ({ ...prevState, errors }));
    }
    else {
      // this will not catch problems if the api is unresponsive (not running for example)
      console.log('API returned an unexpected status code of ', response.status);
      setSignUpState(prevState => ({
        ...prevState, errors: [ `Fatal error: API returned an unexpected status code of ${response.status}` ] }));
    }    
  }

  function handleSubmit() {
    console.log('sign up data:', signUpState);
    signUp();
  }

  return (
    <main>
      <div className='form--centered'>
        <h2>Sign Up</h2>          
        <Form
          cancel={handleCancel}
          errors={signUpState.errors}
          submit={handleSubmit}
          submitButtonText='Sign Up'
          elements={() => (
            <>
              <label htmlFor='firstName'>First Name</label>
              <input 
                id='firstName' 
                name='firstName' 
                type='text'  
                autoComplete='given-name'
                value={signUpState.firstName}
                onChange={change}
              />
              <label htmlFor='lastName'>Last Name</label>
              <input 
                id='lastName' 
                name='lastName' 
                type='text' 
                autoComplete='family-name' 
                value={signUpState.lastName}
                onChange={change}
              />
              <label htmlFor='emailAddress'>Email Address</label>
              <input 
                id='emailAddress' 
                name='emailAddress' 
                type='email'  
                autoComplete='email'
                value={signUpState.emailAddress}
                onChange={change}
              />
              <label htmlFor='password'>Password</label>
              <input 
                id='password' 
                name='password' 
                type='password'
                autoComplete='new-password'
                value={signUpState.password}
                onChange={change}
              />
              <label htmlFor='passwordValidate'>Confirm Password</label>
              <input 
                id='passwordValidate' 
                name='passwordValidate' 
                type='password'  
                value={signUpState.passwordValidate}
                onChange={change}
              />
              <label htmlFor='dateOfBirth'>date of birth</label>
              <input 
                id='dateOfBirth' 
                name='dateOfBirth' 
                type='date'  
                autoComplete='bday'
                value={signUpState.dateOfBirth}
                onChange={change}
              />
            </>
          )}             
        />
        <p>Already have a user account? <Link to='/signin'>Click here</Link> to sign in!</p>
      </div>
    </main>
  );
}