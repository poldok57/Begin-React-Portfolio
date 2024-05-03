import { SectionWrapper } from "../atom/SectionWrapper";
import { Loader } from "../atom/Loader/Loader";
import { Comment } from "./Comment";
import { CommentForm } from "./CommentForm";
import { useFetch } from "../../hooks/useFetch";
import { commentsUrl } from "../../lib/api-url";
import { addComment } from "../../lib/add-comment";

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
        <div className="m-auto flex w-full max-w-2xl flex-col items-center gap-8 ">
          <p>Error: {String(error)}</p>
        </div>
      </SectionWrapper>
    );
  }

  if (!isLoaded || status === "idle") {
    return (
      <SectionWrapper title="Any comment ?">
        <div className="m-auto flex w-full max-w-2xl flex-col items-center gap-8 ">
          <Loader />
        </div>
      </SectionWrapper>
    );
  }

  return (
    <SectionWrapper title="Any comment ?">
      <div className="m-auto flex w-full max-w-2xl flex-col items-center gap-8 ">
        <div className="grid w-full grid-cols-auto-fill-200-300 justify-center gap-4">
          {comments.map((comment) => (
            <Comment key={comment.id} {...comment} />
          ))}
        </div>
        <CommentForm addComment={handleAddComment} />
      </div>
    </SectionWrapper>
  );
};
