export const isTouchDevice = (trace: boolean = false) => {
  if (typeof window === "undefined") return false;

  const isTouchDevice =
    "ontouchstart" in window ||
    navigator.maxTouchPoints > 0 ||
    ("msMaxTouchPoints" in navigator && navigator.msMaxTouchPoints);

  if (trace) {
    if (isTouchDevice) {
      console.log("L'appareil dispose d'un écran tactile");
    } else {
      console.log("L'appareil ne dispose pas d'un écran tactile");
    }
  }
  return isTouchDevice;
};
