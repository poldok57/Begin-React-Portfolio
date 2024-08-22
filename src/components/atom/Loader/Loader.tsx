import styles from "./Loader.module.css";

export const Loader = () => {
  return (
    <div className={styles.loader}>
      <div></div>
      <div></div>
      <div></div>
      <div></div>
      <div></div>
      <div></div>
      <div></div>
      <div></div>
    </div>
  );
};

export const CenteredLoader = () => {
  return (
    <div className="flex justify-center items-center w-full h-screen">
      <Loader />
    </div>
  );
};
