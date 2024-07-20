import { Typography } from "../atom/Typography";

export const Comment = ({ username, comment, createdAt }) => {
  const createdAtDate = new Date(createdAt);

  const twoDigits = (number) => (Number(number) < 10 ? `0${number}` : number);
  const formattedDate = `${twoDigits(createdAtDate.getHours())}:${twoDigits(
    createdAtDate.getMinutes()
  )} - ${twoDigits(createdAtDate.getDate())}/${twoDigits(
    createdAtDate.getMonth()
  )}/${createdAtDate.getFullYear()}`;

  return (
    <fieldset className="flex flex-col justify-between p-4 pt-2 border border-opacity-25 rounded-lg shadow-lg border-secondary bg-paper min-w-60 md:min-w-72 w-fit">
      <legend className="p-1 px-3 text-sm font-semibold border-2 rounded-full text border-secondary bg-background text-primary">
        {username}
      </legend>
      <Typography variant="body2" className="mb-2 break-all">
        {comment}
      </Typography>
      <Typography
        variant="body2"
        color="primary"
        className="self-end text-xs italic "
      >
        {formattedDate}
      </Typography>
    </fieldset>
  );
};
