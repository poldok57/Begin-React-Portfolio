/**
 * Creat a placeholder to keep the position of the component
 * when the position is changed from relative to absolute
 * @param {HTMLElement} component
 */
export const creatPlaceholder = (component: HTMLElement) => {
  // reccording the position of the component
  if (!component) {
    return null;
  }
  const rect = component.getBoundingClientRect();
  const backgroundColor = window.getComputedStyle(component).backgroundColor;

  // create a placeholder to keep the position
  const placeholder: HTMLElement = document.createElement("div");
  placeholder.style.width = `${rect.width}px`;
  placeholder.style.height = `${rect.height}px`;
  placeholder.style.backgroundColor = backgroundColor;
  placeholder.style.position = "relative";
  placeholder.style.border = "1px dashed gray";
  placeholder.style.boxSizing = "border-box"; // placeholder must have the same size as the component
  placeholder.style.transition =
    "border 7s ease-out, background-color 3s ease-out";

  // Insert the placeholder before the component
  component.parentNode?.insertBefore(placeholder, component);

  setTimeout(() => {
    placeholder.style.border = "0px solid transparent";
    placeholder.style.backgroundColor = "transparent";
    // Make the border and background disappear
  }, 500); // start transition after 1s
  return placeholder;
};
