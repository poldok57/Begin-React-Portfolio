export const addComment = (url, newComment, onSuccess) => {
  // send the form in POST request to the commentsUrl
  return fetch(url, {
    method: "POST",
    body: JSON.stringify(newComment),
  }).then(async (response) => {
    const json = await response.json();
    if (response.ok) {
      onSuccess && onSuccess();
      return json;
    }
    return Promise.reject(json);
  });
};
