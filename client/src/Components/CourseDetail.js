import React, { useState, useEffect, useContext } from 'react';
import { AuthenticatedUserContext } from './Context';
import { withRouter, Link, useParams } from "react-router-dom";
import ReactMarkdown from 'react-markdown';

// CourseDetail - This component provides the "Course Detail" screen by 
// retrieving the detail for a course from the REST API's /api/courses/:id 
// route and rendering the course. The component also renders a "Delete Course" 
// button that when clicked should send a DELETE request to the REST API's 
// /api/courses/:id route in order to delete a course. This component also 
// renders an "Update Course" button for navigating to the "Update Course" 
// screen.

function CourseDetail(props) {

  const context = useContext(AuthenticatedUserContext);
  const [deleteTriggered, setDeleteTriggered] = useState(false);
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
    if (deleteTriggered) {
      return;
    }
    console.log('CourseDetail: calling useEffect()');
    let mounted = true; // https://www.benmvp.com/blog/handling-async-react-component-effects-after-unmount/
    (async () => {
      try {
        const response = await context.actions.api(`/courses/${id}`, 'GET');
        console.log('http response was: ', response.status);
        if (response.status === 200) {
          const courseDetails = await response.json();
          if (mounted) {
            setCourse(courseDetails);
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
    }  }, [id, props.history, context.actions, deleteTriggered]);

  async function deleteCourse() {
    setDeleteTriggered(true);
    try {
      console.log(`Attempting to delete course ${id}`);
      const response = await context.actions.api(
        `/courses/${id}`, 'DELETE', null, true, context.authenticatedUser);
      
      console.log('http response was: ', response.status);
      if (response.status === 204) {
        // success, back to main page
        props.history.push('/'); 
      }
      else if (response.status === 403) {
        const { message } = await response.json();
        console.log(`Authorization error deleting the course ${id}: ${message}`);
        context.actions.setErrorMessage(`Failed to delete course ${id}: ${message}`);
        props.history.push('/forbidden'); 
      }
      else if (response.status === 404) {
        const { message } = await response.json();
        console.log(`Error 404 'Not Found' while deleting the course ${id}: ${message}`);
        context.actions.setErrorMessage(`Failed to delete course ${id}: ${message}`);
        props.history.push('/notfound'); 
      }
    } catch(error) {
      console.log('Failed to fetch API');
      context.actions.setErrorMessage(`Failed to fetch API`);
      props.history.push('/error'); 
    };
  }

  // The following function shows the 'Update Course' and 'Delete Course' 
  // buttons, but only if:
  //   - The user is signed in
  //   - The user is editing his own course
  function showEditButtons() {
    const courseLoaded = (course.id && (course.id === +id));
    const { authenticatedUser } = context;
    if (courseLoaded && authenticatedUser) {
      if (course.courseUser.emailAddress === authenticatedUser.emailAddress) { 
      // if (true) {
        return (
          <>
            <Link className="button" to={`/courses/${id}/update`}>Update Course</Link>
            <Link className="button" to="#" onClick={deleteCourse}>Delete Course</Link>
          </>                    
        );
      }
    }
    return null;
  }

  return (
    <main>
      <div className="actions--bar">
        <div className="wrap">
          { showEditButtons() }
          <Link className="button button-secondary" to="/">Return to List</Link>
        </div>
      </div>      
      <div className="wrap">
        { 
          course.id 
            ? <h2>Course Detail</h2>
            : <h2>Loading course data... Please wait</h2>
        }        
        <form>
          <div className="main--flex">
            <div>
              <h3 className="course--detail--title">Course</h3>
              <h4 className="course--name">{course.title}</h4>
              <p>By {`${course.courseUser.firstName} ${course.courseUser.lastName}`}</p>
              <ReactMarkdown>
                {course.description}
              </ReactMarkdown>
              
            </div>
            <div>
              <h3 className="course--detail--title">Estimated Time</h3>
              <p>{course.estimatedTime}</p>
              <h3 className="course--detail--title">Materials Needed</h3>
              <ul className="course--detail--list">
                <ReactMarkdown>
                  {course.materialsNeeded}
                </ReactMarkdown>
              </ul>
            </div>
          </div>  
        </form>
      </div>
    </main>
  );
}

export default withRouter(CourseDetail);