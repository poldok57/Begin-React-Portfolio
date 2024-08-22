import clsx from "clsx";

/**
 *
 * @param socialNetworks {{url: string, name: string, icon: React.ReactElement}[]}
 * @param className string
 * @constructor
 */
export const SocialNetworks = ({
  socialNetworks,
  className,
}: {
  socialNetworks: Array<{
    url: string;
    name: string;
    icon: React.ReactElement;
  }>;
  className?: string;
}) => {
  return (
    <div className={clsx("flex gap-4", className)}>
      {socialNetworks.map(
        ({
          url,
          name,
          icon,
        }: {
          url: string;
          name: string;
          icon: React.ReactElement;
        }) => (
          <a
            key={url}
            href={url}
            className="flex gap-1 items-center text-base text-primary text"
          >
            {icon} <span className="underline">{name}</span>
          </a>
        )
      )}
    </div>
  );
};
