import { useEffect, useRef } from "react";

export const useOnRenderStyle = (bgColor = "#27ae60", off = false) => {
  const ref: React.MutableRefObject<HTMLDivElement | null> = useRef(null);
  const refColor: React.MutableRefObject<string | null> = useRef(null);

  useEffect(() => {
    if (off || !ref.current || ref.current.style.backgroundColor === bgColor)
      return;

    if (refColor.current === null)
      refColor.current = ref.current.style.backgroundColor;

    ref.current.style.backgroundColor = bgColor;
    ref.current.style.transition = "background-color 0.25s";

    const timeout = setTimeout(() => {
      if (refColor.current && ref.current) {
        ref.current.style.backgroundColor = refColor.current;
      }
    }, 200);

    return () => {
      clearTimeout(timeout);
    };
  });

  return ref;
};

interface HightLightOnRenderProps extends React.HTMLAttributes<HTMLDivElement> {
  hightLightColor?: string;
  off?: boolean;
  children: React.ReactNode;
}
export const HightLightOnRender: React.FC<HightLightOnRenderProps> = ({
  hightLightColor,
  off = false,
  children,
  ...props
}) => {
  const ref = useOnRenderStyle(hightLightColor, off);

  return (
    <div {...props} ref={ref}>
      {children}
    </div>
  );
};
