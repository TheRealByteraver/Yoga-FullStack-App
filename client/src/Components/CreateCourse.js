import React, { useState, useContext } from 'react';
import { AuthenticatedUserContext } from './Context';
import Form from './Form';
import { withRouter } from "react-router";
// import { Link } from 'react-router-dom';


// CreateCourse - This component provides the "Create Course" screen by 
// rendering a form that allows a user to create a new course. The component
//  also renders a "Create Course" button that when clicked sends a POST 
//  request to the REST API's /api/courses route. This component also renders 
//  a "Cancel" button that returns the user to the default route (i.e. the 
// list of courses).

function CreateCourse(props) {

  const context = useContext(AuthenticatedUserContext);

  const [createCourseState, setCreateCourseState] = useState({
    courseTitle: '',
    courseDescription: '',
    estimatedTime: '',
    materialsNeeded: '',
    errors: []
  });    

  function change(event) {
    const name = event.target.name;
    const value = event.target.value;

    setCreateCourseState((prevState) => {
      return {
        ...prevState,
        [name]: value
      };
    });
  }  

  function handleCancel() {
    props.history.push('/'); 
  }

  async function createCourse() {
    try {
      console.log('trying to create the course: ', createCourseState,
        '\n with user credentials: ', context.authenticatedUser);
      const response = await context.actions.api(
        '/courses', 'POST', 
        {
          ...createCourseState,
          title: createCourseState.courseTitle,
          description: createCourseState.courseDescription
        },
        true, context.authenticatedUser);
      console.log('http response was: ', response.status);
      if (response.status === 201) {
        props.history.push('/'); 
      }
      else if (response.status === 400) {
        const { errors } = await response.json();
        console.log('Validation error creating the course: ', errors);
        setCreateCourseState(prevState => ({ ...prevState, errors }));
      }
      else {
        console.log('API returned an unexpected status code of ', response.status);
        context.actions.setErrorMessage(`Unable to interpret API response ${response.status}`);
        props.history.push('/error'); 
      }    
    } catch(error) {
      console.log('Failed to fetch API');
      context.actions.setErrorMessage(`Failed to fetch API`);
      props.history.push('/error'); 
    };
  }

  function handleSubmit() {
    createCourse();
  }  

  const { firstName, lastName } = context.authenticatedUser;

  return (
    <main>
      <div className="wrap">
        <h2>Create Course</h2>
        <Form
          cancel={handleCancel}
          errors={createCourseState.errors}
          submit={handleSubmit}
          submitButtonText="Create Course"
          elements={() => (
            <div className="main--flex">
              <div>
                <label htmlFor="courseTitle">Course Title</label>
                <input
                  id="courseTitle" 
                  name="courseTitle" 
                  type="text" 
                  value={createCourseState.courseTitle} 
                  onChange={change} 
                  placeholder="" 
                />
                <p>By {firstName} {lastName}</p>
                <label htmlFor="courseDescription">Course Description</label>
                <textarea 
                  id="courseDescription" 
                  name="courseDescription"
                  value={createCourseState.courseDescription} 
                  onChange={change} 
                  placeholder="" 
                />
              </div>
              <div>
                <label htmlFor="estimatedTime">Estimated Time</label>
                <input 
                  id="estimatedTime" 
                  name="estimatedTime" 
                  type="text"                  
                  value={createCourseState.estimatedTime} 
                  onChange={change} 
                  placeholder="" 
                />
                <label htmlFor="materialsNeeded">Materials Needed</label>
                <textarea 
                  id="materialsNeeded" 
                  name="materialsNeeded"
                  value={createCourseState.materialsNeeded} 
                  onChange={change} 
                  placeholder="" 
                />
              </div>
            </div>
        )} />
      </div>
    </main>
  );
}

export default withRouter(CreateCourse);