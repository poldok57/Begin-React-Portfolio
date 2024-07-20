import { useState, useRef } from "react";

import { TextField } from "../atom/TextField";

import { ErrorMessage } from "../atom/ErrorMessage";
import { Button } from "../atom/Button";

import { commentsUrl } from "../../lib/api-url";

export const CommentForm = ({ addComment }) => {
  const errorMessage = useRef({
    username: "",
    comment: "",
  });
  const [errorSending, setErrorSending] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    const username = e.target.username.value;
    const comment = e.target.comment.value;

    errorMessage.current.comment = "";
    errorMessage.current.username = "";

    // if username is less than 3 characters return an error
    if (username.length < 3) {
      errorMessage.current.username = "Username must be at least 3 characters";
    }

    if (username.length > 20) {
      errorMessage.current.username =
        "Username must be less than 20 characters";
    }

    // if comment is less than 10 characters return an error
    if (comment.length < 10) {
      errorMessage.current.comment = "Comment must be at least 10 characters";
    }
    if (comment.length > 200) {
      errorMessage.current.comment = "Comment must be less than 200 characters";
    }

    if (errorMessage.current.username || errorMessage.current.comment) {
      setErrorSending("Please correct the error(s) below");
      return false;
    }

    // send the form in POST request to the commentsUrl
    addComment({ username, comment })
      .then(() => {
        setErrorSending(null);
        e.target.reset();
      })
      .catch((error) => {
        setErrorSending("Something wrong happend: " + error.error);
      });
  };

  return (
    // send the form in POST request to the commentsUrl

    <form
      action={commentsUrl}
      id="commentForm"
      method="POST"
      className="flex flex-col w-full gap-4 md:px-8"
      onSubmit={(e) => handleSubmit(e)}
    >
      {errorSending && <ErrorMessage> {errorSending} </ErrorMessage>}
      <TextField
        label="Username"
        id="username"
        type="text"
        placeholder="Username"
      />
      {errorMessage.current.username && (
        <ErrorMessage> {errorMessage.current.username} </ErrorMessage>
      )}
      <TextField
        label="Commentaire"
        id="comment"
        type="text"
        placeholder="Commentaire"
        component="textarea"
      />
      {errorMessage.current.comment && (
        <ErrorMessage> {errorMessage.current.comment} </ErrorMessage>
      )}
      <Button position="over" type="submit">
        Submit
      </Button>
    </form>
  );
};
