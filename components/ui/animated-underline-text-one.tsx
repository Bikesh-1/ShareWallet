"use client";

import * as React from "react";
import { motion, type Variants } from "framer-motion";

interface AnimatedTextProps extends React.HTMLAttributes<HTMLDivElement> {
  text: string;
  textClassName?: string;
  underlineClassName?: string;
  underlinePath?: string;
  underlineHoverPath?: string;
  underlineDuration?: number;
}

const AnimatedText = React.forwardRef<HTMLDivElement, AnimatedTextProps>(
  (
    {
      text,
      textClassName = "",
      underlineClassName = "",
      underlinePath = "M 0,10 Q 75,0 150,10 Q 225,20 300,10",
      underlineHoverPath = "M 0,10 Q 75,20 150,10 Q 225,0 300,10",
      underlineDuration = 1.5,
      className = "",
      ...props
    },
    ref,
  ) => {
    const pathVariants: Variants = {
      hidden: { pathLength: 0, opacity: 0 },
      visible: {
        pathLength: 1,
        opacity: 1,
        transition: { duration: underlineDuration, ease: "easeInOut" },
      },
    };

    return (
      <div
        ref={ref}
        className={`inline-flex flex-col items-center justify-center align-baseline gap-2 ${className}`}
        {...props}
      >
        <div className="relative inline-block">
          <motion.span
            className={`inline-block ${textClassName}`}
            initial={{ y: -18, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.65, ease: "easeOut" }}
            whileHover={{ scale: 1.015 }}
          >
            {text}
          </motion.span>
          <motion.svg
            aria-hidden="true"
            width="100%"
            height="20"
            viewBox="0 0 300 20"
            preserveAspectRatio="none"
            className={`pointer-events-none absolute -bottom-3 left-0 overflow-visible ${underlineClassName}`}
          >
            <motion.path
              d={underlinePath}
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              fill="none"
              variants={pathVariants}
              initial="hidden"
              animate="visible"
              whileHover={{
                d: underlineHoverPath,
                transition: { duration: 0.8 },
              }}
            />
          </motion.svg>
        </div>
      </div>
    );
  },
);

AnimatedText.displayName = "AnimatedText";

export { AnimatedText };
