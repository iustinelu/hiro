"use client";

import { useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { tokens } from "@hiro/ui-tokens";

/* ─── Types ────────────────────────────────────────────────────────────── */

export interface AllDoneCelebrationProps {
  totalPoints: number;
  onDismiss: () => void;
}

/* ─── Confetti Config ──────────────────────────────────────────────────── */

const CONFETTI_COUNT = 40;
const COLORS = [
  tokens.color.accent,
  tokens.color.success,
  tokens.color.accentAlt,
  tokens.color.accentInk,
  tokens.color.warning,
];

interface ConfettiPiece {
  x: number; // start x as vw %
  size: number;
  color: string;
  delay: number;
  rotation: number;
  drift: number; // horizontal sway
  isRect: boolean;
}

function generateConfetti(): ConfettiPiece[] {
  return Array.from({ length: CONFETTI_COUNT }, () => ({
    x: Math.random() * 100,
    size: 5 + Math.random() * 7,
    color: COLORS[Math.floor(Math.random() * COLORS.length)],
    delay: Math.random() * 0.5,
    rotation: Math.random() * 360,
    drift: (Math.random() - 0.5) * 80,
    isRect: Math.random() > 0.4,
  }));
}

/* ─── Component ────────────────────────────────────────────────────────── */

export default function AllDoneCelebration({
  totalPoints,
  onDismiss,
}: AllDoneCelebrationProps) {
  const confetti = useMemo(generateConfetti, []);

  useEffect(() => {
    const timer = setTimeout(onDismiss, 3000);
    return () => clearTimeout(timer);
  }, [onDismiss]);

  return (
    <AnimatePresence>
      <motion.div
        key="celebration-overlay"
        onClick={onDismiss}
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 10000,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
          overflow: "hidden",
        }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
      >
        {/* ── Backdrop ──────────────────────────────────────────────── */}
        <motion.div
          style={{
            position: "absolute",
            inset: 0,
            background: tokens.color.overlay,
            backdropFilter: "blur(4px)",
          }}
        />

        {/* ── Confetti pieces ───────────────────────────────────────── */}
        {confetti.map((c, i) => (
          <motion.div
            key={i}
            style={{
              position: "absolute",
              top: -20,
              left: `${c.x}%`,
              width: c.isRect ? c.size * 0.6 : c.size,
              height: c.size,
              borderRadius: c.isRect ? 2 : "50%",
              backgroundColor: c.color,
            }}
            initial={{ y: -20, rotate: 0, opacity: 1 }}
            animate={{
              y: "100vh",
              x: c.drift,
              rotate: c.rotation + 360,
              opacity: [1, 1, 0.8, 0],
            }}
            transition={{
              duration: 2 + Math.random() * 1,
              delay: c.delay,
              ease: "easeIn",
            }}
          />
        ))}

        {/* ── Summary card ──────────────────────────────────────────── */}
        <motion.div
          style={{
            position: "relative",
            zIndex: 1,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 12,
            padding: "32px 40px",
            borderRadius: tokens.radius.xl,
            background: tokens.color.surface,
            border: `2px solid ${tokens.color.accent}`,
            boxShadow: `0 0 40px ${tokens.color.accentSoft}, 0 0 80px ${tokens.color.accentSoft}, ${tokens.elevation.high}`,
            fontFamily: tokens.typography.fontFamily,
            textAlign: "center",
          }}
          initial={{ scale: 0.4, y: 40, opacity: 0 }}
          animate={{ scale: 1, y: 0, opacity: 1 }}
          transition={{
            type: "spring",
            stiffness: 300,
            damping: 15,
            mass: 0.8,
            delay: 0.15,
          }}
        >
          <motion.div
            style={{ fontSize: 40 }}
            animate={{ rotate: [0, -10, 10, -5, 5, 0], scale: [1, 1.2, 1] }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            {"\uD83C\uDF89"}
          </motion.div>

          <span
            style={{
              fontSize: 22,
              fontWeight: 800,
              color: tokens.color.ink,
              letterSpacing: "-0.02em",
            }}
          >
            All tasks complete!
          </span>

          <motion.span
            style={{
              fontSize: 18,
              fontWeight: 700,
              color: tokens.color.accent,
            }}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
          >
            +{totalPoints} points today
          </motion.span>

          <span
            style={{
              fontSize: 13,
              color: tokens.color.inkMuted,
              marginTop: 4,
            }}
          >
            Tap to dismiss
          </span>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
