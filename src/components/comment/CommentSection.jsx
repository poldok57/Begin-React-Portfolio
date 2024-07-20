import { SectionWrapper } from "../atom/SectionWrapper";
import { Loader } from "../atom/Loader/Loader";
import { Comment } from "./Comment";
import { CommentForm } from "./CommentForm";
import { useFetch } from "../../hooks/useFetch";
import { commentsUrl } from "../../lib/api-url";
import { addComment } from "../../lib/add-comment";
import clsx from "clsx";

export const CommentSection = () => {
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

  if (status === "rejected") {
    return (
      <SectionWrapper title="Any comment ?">
        <div className="flex flex-col items-center w-full max-w-2xl gap-8 m-auto border-2 border-red-600 rounded-2xl">
          <p>Error: {String(error)}</p>
        </div>
      </SectionWrapper>
    );
  }

  if (!isLoaded || status === "idle") {
    return (
      <SectionWrapper title="Any comment ?">
        <div className="flex flex-col items-center w-full max-w-4xl gap-8 m-auto border border-secondary border-opacity-60 rounded-2xl">
          <Loader />
        </div>
      </SectionWrapper>
    );
  }

  return (
    <SectionWrapper title="Any comment ?">
      <div
        className={clsx(
          "flex flex-col items-center w-full max-w-4xl m-auto rounded-2xl p-3",
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
            <div className="grid justify-center w-full grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
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
