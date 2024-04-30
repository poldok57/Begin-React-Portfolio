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
    <fieldset className="flex flex-col justify-between rounded-md border-opacity-25 bg-paper p-4 pt-2">
      <legend className="text rounded-full border-2 border-secondary bg-background p-1 px-3 text-sm font-semibold text-primary">
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
