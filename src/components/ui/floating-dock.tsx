"use client";
/**
 * Note: Use position fixed according to your needs
 * Desktop navbar is better positioned at the bottom
 * Mobile navbar is better positioned at bottom right.
 *
 * Ported from Aceternity UI's Floating Dock (https://ui.aceternity.com/components/floating-dock),
 * adapted onto this project's existing `framer-motion` dependency (the original uses the
 * renamed `motion/react` package) and `react-icons` (the original uses `@tabler/icons-react`
 * for the mobile collapse glyph only — swapped for react-icons' own Tabler set, `react-icons/tb`,
 * so no extra icon package is needed).
 **/

import Link from "next/link";
import { cn } from "@/lib/utils";
import { AnimatePresence, type MotionValue, motion, useMotionValue, useSpring, useTransform } from "framer-motion";

import { useRef, useState, type ReactNode } from "react";

export const FloatingDock = ({
  items,
  desktopClassName,
  mobileClassName,
}: {
  items: { title: string; icon: ReactNode; href: string }[];
  desktopClassName?: string;
  mobileClassName?: string;
}) => {
  return (
    <>
      <FloatingDockDesktop items={items} className={desktopClassName} />
      <FloatingDockMobile items={items} className={mobileClassName} />
    </>
  );
};

const FloatingDockMobile = ({
  items,
  className,
}: {
  items: { title: string; icon: ReactNode; href: string }[];
  className?: string;
}) => {
  return (
    <div className={cn("flex flex-row items-center gap-3 lg:hidden", className)}>
      {items.map((item) => (
        <Link
          key={item.title}
          href={item.href}
          aria-label={item.title}
          className="flex h-10 w-10 items-center justify-center rounded-full border border-[var(--border-muted)] bg-[var(--surface-soft)]"
        >
          <div className="h-4 w-4">{item.icon}</div>
        </Link>
      ))}
    </div>
  );
};

const FloatingDockDesktop = ({
  items,
  className,
}: {
  items: { title: string; icon: ReactNode; href: string }[];
  className?: string;
}) => {
  const mouseX = useMotionValue(Infinity);
  return (
    <motion.div
      onMouseMove={(e) => mouseX.set(e.pageX)}
      onMouseLeave={() => mouseX.set(Infinity)}
      className={cn(
        "mx-auto hidden h-20 items-center gap-6 lg:flex",
        className,
      )}
    >
      {items.map((item) => (
        <IconContainer mouseX={mouseX} key={item.title} {...item} />
      ))}
    </motion.div>
  );
};

function IconContainer({
  mouseX,
  title,
  icon,
  href,
}: {
  mouseX: MotionValue;
  title: string;
  icon: ReactNode;
  href: string;
}) {
  const ref = useRef<HTMLDivElement>(null);

  const distance = useTransform(mouseX, (val) => {
    const bounds = ref.current?.getBoundingClientRect() ?? { x: 0, width: 0 };
    return val - bounds.x - bounds.width / 2;
  });

  const widthTransform = useTransform(distance, [-150, 0, 150], [40, 80, 40]);
  const heightTransform = useTransform(distance, [-150, 0, 150], [40, 80, 40]);

  const widthTransformIcon = useTransform(distance, [-150, 0, 150], [20, 40, 20]);
  const heightTransformIcon = useTransform(distance, [-150, 0, 150], [20, 40, 20]);

  const width = useSpring(widthTransform, { mass: 0.1, stiffness: 150, damping: 12 });
  const height = useSpring(heightTransform, { mass: 0.1, stiffness: 150, damping: 12 });

  const widthIcon = useSpring(widthTransformIcon, { mass: 0.1, stiffness: 150, damping: 12 });
  const heightIcon = useSpring(heightTransformIcon, { mass: 0.1, stiffness: 150, damping: 12 });

  const [hovered, setHovered] = useState(false);

  return (
    <Link href={href}>
      <motion.div
        ref={ref}
        style={{ width, height }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        className="relative flex aspect-square items-center justify-center rounded-full border border-[var(--border-muted)] bg-black/30"
      >
        <AnimatePresence>
          {hovered && (
            <motion.div
              initial={{ opacity: 0, y: -10, x: "-50%" }}
              animate={{ opacity: 1, y: 0, x: "-50%" }}
              exit={{ opacity: 0, y: -2, x: "-50%" }}
              className="absolute -bottom-8 left-1/2 z-50 w-fit whitespace-pre rounded-md border border-[var(--border-muted)] bg-[var(--surface-raised)] px-2 py-0.5 text-xs text-[var(--white)] shadow-lg"
            >
              {title}
            </motion.div>
          )}
        </AnimatePresence>
        <motion.div style={{ width: widthIcon, height: heightIcon }} className="flex items-center justify-center">
          {icon}
        </motion.div>
      </motion.div>
    </Link>
  );
}
