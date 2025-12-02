import { useState, useLayoutEffect, useCallback, RefObject } from "react";

interface Position {
  top: number;
  left: number;
  placement: "top" | "bottom";
}

const CARD_WIDTH = 400;
const CARD_HEIGHT = 300;
const GAP = 8;

export function useCitationPosition(
  containerRef: RefObject<HTMLElement>,
  isOpen: boolean
): Position {
  const [position, setPosition] = useState<Position>({
    top: 0,
    left: 0,
    placement: "bottom",
  });

  const calculatePosition = useCallback(() => {
    const el = containerRef.current;
    if (!el) return;

    const rect = el.getBoundingClientRect();
    const vw = window.innerWidth;
    const vh = window.innerHeight;

    const vertical = calculateVerticalPosition(rect, vh);
    const horizontal = calculateHorizontalPosition(rect, vw);

    setPosition({
      top: vertical.top,
      left: horizontal,
      placement: vertical.placement,
    });
  }, [containerRef]);

  useLayoutEffect(() => {
    if (!isOpen) return;

    let frame: number;

    const onUpdate = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(calculatePosition);
    };

    calculatePosition();

    window.addEventListener("scroll", onUpdate, true);
    window.addEventListener("resize", onUpdate);

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onUpdate, true);
      window.removeEventListener("resize", onUpdate);
    };
  }, [isOpen, calculatePosition]);

  return position;
}

function calculateVerticalPosition(
  rect: DOMRect,
  vh: number
): { top: number; placement: "top" | "bottom" } {
  const spaceBelow = vh - rect.bottom;
  const spaceAbove = rect.top;

  const fitsBelow = spaceBelow >= CARD_HEIGHT + GAP;
  const fitsAbove = spaceAbove >= CARD_HEIGHT + GAP;

  if (fitsBelow) {
    // Position below the trigger
    return { top: rect.bottom + GAP, placement: "bottom" };
  }

  if (fitsAbove) {
    // Position above the trigger
    return { top: rect.top - CARD_HEIGHT - GAP, placement: "top" };
  }

  // When both sides are cramped, choose the side with more space
  if (spaceBelow >= spaceAbove) {
    return { top: rect.bottom + GAP, placement: "bottom" };
  }

  return { top: rect.top - CARD_HEIGHT - GAP, placement: "top" };
}

function calculateHorizontalPosition(rect: DOMRect, vw: number): number {
  const spaceToRight = vw - rect.left;
  const spaceToLeft = rect.right;

  // Ideal: align left edge if possible
  if (spaceToRight >= CARD_WIDTH) {
    return rect.left;
  }

  // Otherwise try aligning right edge
  if (spaceToLeft >= CARD_WIDTH) {
    return rect.right - CARD_WIDTH;
  }

  // Center if possible
  const centerOffset = (CARD_WIDTH - rect.width) / 2;
  const canCenter =
    rect.left - centerOffset >= GAP &&
    rect.left - centerOffset + CARD_WIDTH <= vw - GAP;

  if (canCenter) {
    return rect.left - centerOffset;
  }

  // Clamp to viewport edges
  if (rect.left < vw / 2) {
    // Clamp left side
    return GAP;
  }

  // Clamp right side
  return vw - CARD_WIDTH - GAP;
}
