import { useEffect } from "react";

import styled from "styled-components";

interface SvgWrapperProps {
  children: React.ReactNode;
  width: number;
  height: number;
  viewBox: string;
  $rotation: number;
  $animationkey: number;
  ref?: React.RefObject<SVGSVGElement>;
  style?: React.CSSProperties;
}

export const SvgWrapper = styled.svg<SvgWrapperProps>`
  transform: rotate(${(props) => props.$rotation}deg);
  ${(props) =>
    props.$animationkey > 0 &&
    `
    @keyframes flash {
      0%, 100% { fill-opacity: 1;
      scale: 1; }
      50% { fill-opacity: 0.5;
      scale: 1.05; }
    }
    animation: flash 1s infinite;
    animation-play-state: ${props.$animationkey > 0 ? "running" : "paused"};
  `}
`;

interface UseAnimationProps {
  flashDuration: number;
  flashDelay: number;
  borderColor: string;
  fillColor: string;
  animationkey: number;
  setAnimationKey: (key: number) => void;
}

export const useAnimation = ({
  flashDuration,
  flashDelay,
  borderColor,
  fillColor,
  animationkey,
  setAnimationKey,
}: UseAnimationProps) => {
  const startAnimation = () => {
    setAnimationKey(animationkey + 1);
  };

  // start animation if flashDuration is greater than 0
  useEffect(() => {
    if (flashDuration === 0) {
      return;
    }
    if (flashDelay === 0) {
      startAnimation();
      return;
    }
    const timer = setTimeout(() => {
      startAnimation();
    }, flashDelay);
    return () => clearTimeout(timer);
  }, [flashDuration, flashDelay, borderColor, fillColor]);

  // stop animation after elapsed time
  useEffect(() => {
    if (animationkey > 0) {
      const timer = setTimeout(() => {
        setAnimationKey(0);
      }, flashDuration * 1000);
      return () => clearTimeout(timer);
    }
  }, [animationkey, flashDuration]);
};
