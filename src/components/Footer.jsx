import { EMAIL, SOCIAL_NETWORKS } from "../lib/config";
import { SocialNetworks } from "./atom/SocialNetwork";
import { Typography } from "./atom/Typography";

export const Footer = () => {
  return (
    <footer className="flex flex-col items-center gap-8 p-4 md:p-8 ">
      <Typography variant="h2">Contact me !</Typography>
      <div className="flex flex-col items-center gap-2">
        <Typography variant="body2">
          I’ll be happy to chat with you about a potential job or a freelance
        </Typography>
        <a
          className="text-base text-primary underline"
          href={`mailto:${EMAIL}`}
        >
          {EMAIL}
        </a>
        <SocialNetworks socialNetworks={SOCIAL_NETWORKS} />
      </div>
      <div className="grid grid-cols-6">
        <div>6</div>
        <div className="grid grid-cols-5">5</div>
        <div className="grid grid-cols-4">4</div>
        <div className="grid grid-cols-3">3</div>
        <div className="grid grid-cols-2">2</div>
        <div>1</div>
      </div>
      <p>
        Created for educational purpose for the{" "}
        <a href="https://codelynx.dev/beginreact">BeginReact.dev formation</a> !
      </p>
    </footer>
  );
};
