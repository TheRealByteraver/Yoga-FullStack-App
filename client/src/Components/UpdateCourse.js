import React, { useState, useContext, useEffect } from 'react';
import { AuthenticatedUserContext } from './Context';
import Form from './Form';
import { withRouter } from "react-router";
import { useParams } from "react-router-dom";

// UpdateCourse - This component provides the "Update Course" screen by 
// rendering a form that allows a user to update one of their existing 
// courses. The component also renders an "Update Course" button that when 
// clicked sends a PUT request to the REST API's /api/courses/:id route. 
// This component also renders a "Cancel" button that returns the user to 
// the "Course Detail" screen.

function UpdateCourse(props) {

  const context = useContext(AuthenticatedUserContext);

  const [course, setCourse] = useState({
    courseTitle: '',
    courseDescription: '',
    estimatedTime: '',
    materialsNeeded: '',
    courseUser: {
      firstName: '',
      lastName: '',
      emailAddress: ''
    },
    errors: []
  }); 

  const { id } = useParams();

  useEffect(() => {
    let mounted = true; // https://www.benmvp.com/blog/handling-async-react-component-effects-after-unmount/
    (async () => {
      try {
        const response = await context.actions.api(`/courses/${id}`, 'GET');
        console.log('http response was: ', response.status);
        if (response.status === 200) {
          const courseDetails = await response.json();
          const { courseUser } = courseDetails;
          if (courseUser.emailAddress !== 
            context.authenticatedUser.emailAddress) {
            console.log(
              `Currently logged in user ` +
              `"${context.authenticatedUser.emailAddress}" has no right to ` + 
              `edit course ${id}: "${courseDetails.title}" because it is ` +
              `owned by ${courseUser.emailAddress}.`);
            context.actions.setErrorMessage(
              `Failed to update course ${id}: user ` +
              `"${context.authenticatedUser.emailAddress}" ` +
              `is not authorized to edit this course.`);
            props.history.push('/forbidden');                               
          } else 
          if (mounted) {
            setCourse({
              ...courseDetails,
              courseTitle: courseDetails.title,
              courseDescription: courseDetails.description
            }); 
          }
        }
        else if (response.status === 404) {
          const { message } = await response.json();
          console.log(`Error retrieving course ${id}: ${message}`);
          context.actions.setErrorMessage(message);
          props.history.push('/notfound'); 
        }
        else {
          console.log('API returned unexpected status code ', response.status);
          context.actions.setErrorMessage(`Unable to interpret API response ${response.status}`);
          props.history.push('/error'); 
        }        
      } catch(error) {
        console.log('Failed to fetch API');
        context.actions.setErrorMessage(`Failed to fetch API`);
        props.history.push('/error'); 
      };
    })();
    return () => {
      mounted = false;
    }    
  }, [id, props.history, context.actions, context.authenticatedUser.emailAddress]);

  function change(event) {
    const name = event.target.name;
    const value = event.target.value;

    setCourse((prevState) => {
      return {
        ...prevState,
        [name]: value
      };
    });
  }    

  function handleCancel() {
    props.history.push(`/courses/${id}`); 
  }

  async function updateCourse() {
    try {
      console.log('trying to update the course: ', course,
        '\n with user credentials: ', context.authenticatedUser);
      const response = await context.actions.api(
        `/courses/${id}`, 'PUT', 
        {
          ...course,
          title: course.courseTitle,
          description: course.courseDescription
        },
        true, context.authenticatedUser);
      console.log('http response was: ', response.status);
      if (response.status === 204) {
        props.history.push(`/courses/${id}`); 
      }
      else if (response.status === 400) {
        const { errors } = await response.json();
        console.log('Validation error updating the course: ', errors);
        setCourse(prevState => ({ ...prevState, errors }));
      }
      else if (response.status === 403) {
        const { message } = await response.json();
        console.log(`Authorization error updating the course ${id}: ${message}`);
        context.actions.setErrorMessage(`Failed to update course ${id}: ${message}`);
        props.history.push('/forbidden'); 
      }
      else if (response.status === 404) {
        const { message } = await response.json();
        console.log(`Error 404 'Not Found' while updating the course ${id}: ${message}`);
        context.actions.setErrorMessage(`Failed to update course ${id}: ${message}`);
        props.history.push('/notfound'); 
      }
      else {
        console.log('API returned an unexpected status code of ', response.status);
        context.actions.setErrorMessage(`Unexpected response from API`);
        props.history.push('/error'); 
      }    
    } catch(error) {
      console.log('Failed to fetch API');
      context.actions.setErrorMessage(`Failed to fetch API`);
      props.history.push('/error'); 
    };
  }

  function handleSubmit() {
    updateCourse();
  }

  const { firstName, lastName } = course.courseUser;

  return (
    <main>
      <div className="wrap">
        { 
          course.id 
            ? <h2>Update Course</h2>
            : <h2>Loading course data... Please wait</h2>
        }        
        <Form
          cancel={handleCancel}
          errors={course.errors}
          submit={handleSubmit}
          submitButtonText="Update Course"
          elements={() => (
          <div className="main--flex">
            <div>
              <label htmlFor="courseTitle">Course Title</label>
              <input 
                id="courseTitle" 
                name="courseTitle" 
                type="text" 
                value={course.courseTitle} 
                onChange={change} 
              />
              <p>By {`${firstName} ${lastName}`}</p>
              <label htmlFor="courseDescription">Course Description</label>
              <textarea 
                id="courseDescription" 
                name="courseDescription" 
                value={course.courseDescription}
                onChange={change} 
              />
            </div>
            <div>
              <label htmlFor="estimatedTime">Estimated Time</label>
              <input 
                id="estimatedTime" 
                name="estimatedTime" 
                type="text" 
                value={course.estimatedTime}
                onChange={change} 
              />
              <label htmlFor="materialsNeeded">Materials Needed</label>
              <textarea 
                id="materialsNeeded" 
                name="materialsNeeded" 
                value={course.materialsNeeded}
                onChange={change} 
              />
            </div>
          </div>
        )} />
      </div>
    </main>
  );
}

export default withRouter(UpdateCourse);