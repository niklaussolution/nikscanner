"use client";
// "use client";

// import { useEffect, useRef, useState, type CSSProperties } from "react";

// export interface TextTypeProps {
//   text: string | string[];
//   typingSpeed?: number;
//   deletingSpeed?: number;
//   pauseDuration?: number;
//   /** Delay (ms) before typing starts, e.g. to sync with the rest of a sentence fading in. */
//   startDelay?: number;
//   loop?: boolean;
//   showCursor?: boolean;
//   cursorCharacter?: string;
//   className?: string;
//   style?: CSSProperties;
// }

// /** React Bits-style "Text Type": types out the given text character by character (looping
//  *  through multiple strings if given an array), with a blinking cursor. */
// export default function TextType({
//   text,
//   typingSpeed = 55,
//   deletingSpeed = 30,
//   pauseDuration = 1800,
//   startDelay = 0,
//   loop = false,
//   showCursor = true,
//   cursorCharacter = "|",
//   className = "",
//   style = {},
// }: TextTypeProps) {
//   const strings = Array.isArray(text) ? text : [text];
//   const [display, setDisplay] = useState("");
//   const [done, setDone] = useState(false);
//   const stringIndexRef = useRef(0);
//   const charIndexRef = useRef(0);
//   const phaseRef = useRef<"typing" | "pausing" | "deleting">("typing");

//   useEffect(() => {
//     const reduced = typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
//     let timeoutId: number;

//     if (reduced) {
//       timeoutId = window.setTimeout(() => {
//         setDisplay(strings[0] ?? "");
//         setDone(true);
//       }, 0);
//       return () => window.clearTimeout(timeoutId);
//     }

//     const tick = () => {
//       const current = strings[stringIndexRef.current % strings.length];

//       if (phaseRef.current === "typing") {
//         charIndexRef.current += 1;
//         setDisplay(current.slice(0, charIndexRef.current));

//         if (charIndexRef.current >= current.length) {
//           const isLastString = stringIndexRef.current === strings.length - 1;
//           if (!loop && isLastString) {
//             setDone(true);
//             return;
//           }
//           phaseRef.current = "pausing";
//           timeoutId = window.setTimeout(tick, pauseDuration);
//           return;
//         }
//         timeoutId = window.setTimeout(tick, typingSpeed);
//         return;
//       }

//       if (phaseRef.current === "pausing") {
//         phaseRef.current = "deleting";
//         timeoutId = window.setTimeout(tick, deletingSpeed);
//         return;
//       }

//       // deleting
//       charIndexRef.current -= 1;
//       setDisplay(current.slice(0, charIndexRef.current));
//       if (charIndexRef.current <= 0) {
//         stringIndexRef.current = (stringIndexRef.current + 1) % strings.length;
//         phaseRef.current = "typing";
//         timeoutId = window.setTimeout(tick, typingSpeed);
//         return;
//       }
//       timeoutId = window.setTimeout(tick, deletingSpeed);
//     };

//     timeoutId = window.setTimeout(tick, startDelay + typingSpeed);

//     return () => window.clearTimeout(timeoutId);
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [strings.join("|"), typingSpeed, deletingSpeed, pauseDuration, startDelay, loop]);

//   return (
//     <span className={className} style={style}>
//       {display}
//       {showCursor && !done && <span className="animate-pulse-glow">{cursorCharacter}</span>}
//     </span>
//   );
// }




'use client';

import { useEffect, useRef, useState, useMemo, useCallback } from 'react';
import { gsap } from 'gsap';

interface TextTypeProps {
  className?: string;
  showCursor?: boolean;
  hideCursorWhileTyping?: boolean;
  cursorCharacter?: string | React.ReactNode;
  cursorBlinkDuration?: number;
  cursorClassName?: string;
  text: string | string[];
  as?: 'div' | 'span' | 'p' | 'h1' | 'h2' | 'h3';
  typingSpeed?: number;
  initialDelay?: number;
  pauseDuration?: number;
  deletingSpeed?: number;
  loop?: boolean;
  textColors?: string[];
  variableSpeed?: { min: number; max: number };
  onSentenceComplete?: (sentence: string, index: number) => void;
  startOnVisible?: boolean;
  reverseMode?: boolean;
}

const TextType = ({
  text,
  as: Component = 'div',
  typingSpeed = 50,
  initialDelay = 0,
  pauseDuration = 2000,
  deletingSpeed = 30,
  loop = true,
  className = '',
  showCursor = true,
  hideCursorWhileTyping = false,
  cursorCharacter = '|',
  cursorClassName = '',
  cursorBlinkDuration = 0.5,
  textColors = [],
  variableSpeed,
  onSentenceComplete,
  startOnVisible = false,
  reverseMode = false,
  ...props
}: TextTypeProps & React.HTMLAttributes<HTMLElement>) => {
  const [displayedText, setDisplayedText] = useState('');
  const [currentCharIndex, setCurrentCharIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const [currentTextIndex, setCurrentTextIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(!startOnVisible);
  const cursorRef = useRef<HTMLSpanElement>(null);
  const containerRef = useRef<HTMLElement>(null);

  const textArray = useMemo(() => (Array.isArray(text) ? text : [text]), [text]);

  const getRandomSpeed = useCallback(() => {
    if (!variableSpeed) return typingSpeed;
    const { min, max } = variableSpeed;
    return Math.random() * (max - min) + min;
  }, [variableSpeed, typingSpeed]);

  const getCurrentTextColor = () => {
    if (textColors.length === 0) return 'inherit';
    return textColors[currentTextIndex % textColors.length];
  };

  useEffect(() => {
    if (!startOnVisible || !containerRef.current) return;

    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            setIsVisible(true);
          }
        });
      },
      { threshold: 0.1 }
    );

    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, [startOnVisible]);

  useEffect(() => {
    if (showCursor && cursorRef.current) {
      gsap.set(cursorRef.current, { opacity: 1 });
      const blink = gsap.to(cursorRef.current, {
        opacity: 0,
        duration: cursorBlinkDuration,
        repeat: -1,
        yoyo: true,
        ease: 'power2.inOut'
      });
      return () => {
        blink.kill();
      };
    }
  }, [showCursor, cursorBlinkDuration]);

  useEffect(() => {
    if (!isVisible) return;

    let timeout: ReturnType<typeof setTimeout>;

    const currentText = textArray[currentTextIndex];
    const processedText = reverseMode ? currentText.split('').reverse().join('') : currentText;

    const executeTypingAnimation = () => {
      if (isDeleting) {
        if (displayedText === '') {
          setIsDeleting(false);
          if (currentTextIndex === textArray.length - 1 && !loop) {
            return;
          }

          if (onSentenceComplete) {
            onSentenceComplete(textArray[currentTextIndex], currentTextIndex);
          }

          setCurrentTextIndex(prev => (prev + 1) % textArray.length);
          setCurrentCharIndex(0);
          timeout = setTimeout(() => { }, pauseDuration);
        } else {
          timeout = setTimeout(() => {
            setDisplayedText(prev => prev.slice(0, -1));
          }, deletingSpeed);
        }
      } else {
        if (currentCharIndex < processedText.length) {
          timeout = setTimeout(
            () => {
              setDisplayedText(prev => prev + processedText[currentCharIndex]);
              setCurrentCharIndex(prev => prev + 1);
            },
            variableSpeed ? getRandomSpeed() : typingSpeed
          );
        } else if (textArray.length >= 1) {
          if (!loop && currentTextIndex === textArray.length - 1) return;
          timeout = setTimeout(() => {
            setIsDeleting(true);
          }, pauseDuration);
        }
      }
    };

    if (currentCharIndex === 0 && !isDeleting && displayedText === '') {
      timeout = setTimeout(executeTypingAnimation, initialDelay);
    } else {
      executeTypingAnimation();
    }

    return () => clearTimeout(timeout);
  }, [
    currentCharIndex,
    displayedText,
    isDeleting,
    typingSpeed,
    deletingSpeed,
    pauseDuration,
    textArray,
    currentTextIndex,
    loop,
    initialDelay,
    isVisible,
    reverseMode,
    variableSpeed,
    onSentenceComplete
  ]);

  const shouldHideCursor =
    hideCursorWhileTyping && (currentCharIndex < textArray[currentTextIndex].length || isDeleting);

  return (
    <Component ref={containerRef as React.Ref<never>} className={`inline-block whitespace-pre-wrap tracking-tight ${className}`} {...props}>
      <span className="inline" style={{ color: getCurrentTextColor() || 'inherit' }}>
        {displayedText}
      </span>
      {showCursor && (
        <span
          ref={cursorRef}
          className={`ml-1 inline-block opacity-100 ${shouldHideCursor ? 'hidden' : ''} ${cursorClassName}`}
        >
          {cursorCharacter}
        </span>
      )}
    </Component>
  );
};

export default TextType;
