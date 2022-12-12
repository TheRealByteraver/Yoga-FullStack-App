import React, { useState, useEffect, useContext } from 'react';
import { AuthenticatedUserContext } from './Context';

// Courses - This component provides the 'Courses' screen by retrieving the 
// list of courses from the REST API's /api/courses route and rendering a 
// list of courses. Each course needs to link to its respective 
// 'Course Detail' screen. This component also renders a link to the 
// 'Create Course' screen.

export default function Courses(props) {

  const context = useContext(AuthenticatedUserContext);
  const [courses, setCourses] = useState();

  useEffect(() => {
    let mounted = true; // https://www.benmvp.com/blog/handling-async-react-component-effects-after-unmount/
    (async () => {
      try {
        const response = await context.actions.api('/courses', 'GET');
        console.log('http response was: ', response.status);
        if (response.status === 200) {
          const courses = await response.json();
          if (mounted) {
            setCourses(courses); 
          }
        }
        else {
          console.log('API returned unexpected status code ', response.status);
          context.actions.setErrorMessage(
            `Unable to interpret API response ${response.status}`);
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



    // fetch('http://localhost:5000/api/courses')
    //   .then(response => {
    //     if(response.ok) {
    //       return Promise.resolve(response);
    //     } else {
    //       return Promise.reject(new Error(response.statusText));
    //     }
    //   })
    //   .then(response => response.json())
    //   .then(response => { 
    //     if()

    //     setCourses(response); 
    //     return response;
    //   })
    //   // the debug code below will cause a dependencies warning from React
    //   // because we use the variable 'courses' without specifying it in the
    //   // dependencies array
    //   // .then(() => console.log('courses: ', courses))
    //   .catch(error => {
    //     console.log('Failed to fetch API');
    //     context.actions.setErrorMessage(`Failed to fetch API: ${error}`);
    //     props.history.push('/error'); 
    //   });  
  }, [context.actions, props.history]);

  return (
    <main>
      <div className='wrap main--grid'>
        {
          // Display 'Loading' screen until fetch is complete
          courses 
            ? courses.map(course => 
                <a 
                  key={course.id} 
                  className="course--module course--link" 
                  href={`/courses/${course.id}`} >
                  <h2 className="course--label">Course</h2>
                  <h3 className="course--title">{course.title}</h3>
                </a>)
            : <div className="wrap">
                <h2>Loading courses data... Please wait</h2>
              </div>
        }
        <a className='course--module course--add--module' href='/courses/create'>
          <span className='course--add--title'>
            <svg 
              version='1.1' 
              xmlns='http://www.w3.org/2000/svg' x='0px' y='0px'
              viewBox='0 0 13 13' 
              className='add'>
              <polygon 
                points='7,6 7,0 6,0 6,6 0,6 0,7 6,7 6,13 7,13 7,7 13,7 13,6 ' >
              </polygon>
            </svg>
            New Course
          </span>
        </a>
      </div>
    </main>
  );
}