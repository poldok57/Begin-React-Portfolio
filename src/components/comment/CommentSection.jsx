import { SectionWrapper } from "../atom/SectionWrapper";
import { Loader } from "../atom/Loader/Loader";
import { Comment } from "./Comment";
import { CommentForm } from "./CommentForm";
import { useFetch } from "../../hooks/useFetch";
import { commentsUrl } from "../../lib/api-url";
import { addComment } from "../../lib/add-comment";
import { withMousePosition } from "../windows/withMousePosition";

import clsx from "clsx";

export const CommentLoader = () => {
  const {
    data: comments,
    error,
    isLoaded,
    status,
    run,
  } = useFetch(commentsUrl, {});

  const handleAddComment = (newComment) => {
    return addComment(commentsUrl, newComment, () => run());
  };

  // console.log("status:", status, " comments:", comments);

  return (
    <SectionWrapper
      title="Any comment ?"
      className="py-8 rounded-2xl border border-opacity-50 shadow-md bg-background border-neutral-300"
    >
      <div
        className={clsx(
          [
            "flex flex-col items-center w-fit max-w-5xl m-auto rounded-2xl p-5",
            "bg-paper border border-secondary border-opacity-20 shadow-sm",
          ],
          {
            "border-2 border-red-600": status === "rejected",
            "border border-secondary border-opacity-70":
              status === "idle" || !isLoaded,
            "border border-secondary border-opacity-20 shadow-sm": isLoaded,
          }
        )}
      >
        {status === "rejected" && <p>Error: {String(error)}</p>}
        {(status === "idle" || !isLoaded) && <Loader />}
        {isLoaded && (
          <>
            <div className="grid grid-cols-1 gap-4 justify-center w-full sm:grid-cols-2 lg:grid-cols-3">
              {comments.map((comment) => (
                <Comment key={comment.id} {...comment} />
              ))}
            </div>
            <CommentForm addComment={handleAddComment} />
          </>
        )}
      </div>
    </SectionWrapper>
  );
};

export const CommentLoaderWP = withMousePosition(CommentLoader);

export const CommentSection = () => {
  return (
    <CommentLoaderWP
      title="Your comments"
      titleBar={true}
      withMaximize={true}
      withMinimize={true}
      close={true}
      fixed={true}
    />
  );
};
