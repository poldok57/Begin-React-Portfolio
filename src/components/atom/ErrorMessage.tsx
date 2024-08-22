export const ErrorMessage = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="p-2 text-black bg-red-200 rounded-md border-2 border-red-600 shadow-md">
      {children}
    </div>
  );
};
