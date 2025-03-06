export const getProgressiveStep = (
  initialStep: number,
  maxStep: number,
  increment: number = 10
) => {
  let lastClickTime = 0;
  const memoInitialStep = initialStep;
  const memoMaxStep = maxStep;
  let lastAction: string | null = null;
  let currentStep = memoInitialStep;

  const onProgressiveStep = (action: string) => {
    // console.log("lastAction", lastAction, "lastClick", lastClickTime);
    if (action === lastAction && lastClickTime !== 0) {
      const now = Date.now();
      const timeDiff = now - lastClickTime;

      if (timeDiff < 300) {
        // if the click is fast (less than 300ms), increase the step
        currentStep = Math.min(currentStep + increment, memoMaxStep);
      } else if (timeDiff > 1200) {
        // if the click is slow (more than 1200ms), reset the step
        currentStep = memoInitialStep;
      }
      // between 300ms and 1200ms, we don't change the step

      lastClickTime = now;
    } else {
      // first click or the direction has changed
      lastClickTime = Date.now();
      currentStep = memoInitialStep;
      lastAction = action;
    }

    return currentStep;
  };

  return onProgressiveStep;
};
