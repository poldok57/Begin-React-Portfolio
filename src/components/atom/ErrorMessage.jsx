export const ErrorMessage = ({ children }) => {
  return (
    <div className="rounded-md border-2 border-red-600 bg-red-200 p-2 text-black shadow-md ">
      {children}
    </div>
  );
};
