import React from 'react';

export default function Form(props) {
  const {
    cancel,
    errors,
    submit,
    submitButtonText,
    elements,
  } = props;

  function handleSubmit(event) {
    event.preventDefault();
    submit();
  }

  function handleCancel(event) {
    event.preventDefault();
    cancel();
  }

  return (
    <div>
      <ErrorsDisplay errors={errors} />
      <form onSubmit={handleSubmit}>
        {elements()}
        <button className="button" type="submit">{submitButtonText}</button>
        <button className="button button-secondary" onClick={handleCancel}>Cancel</button>
      </form>
    </div>
  );
}

function ErrorsDisplay({ errors }) {
  let errorsDisplay = null;

  if (!errors) {
    return null;
  }

  if (errors.length) {
    errorsDisplay = (
      <div className="validation--errors">
        <h3>Validation Errors</h3>
        <ul>
          {errors.map((error, i) => <li key={i}>{error}</li>)}
        </ul>
      </div>
    );
  }

  return errorsDisplay;
}
