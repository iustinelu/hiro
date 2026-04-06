"use client";

import { useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { tokens } from "@hiro/ui-tokens";

/* ─── Types ────────────────────────────────────────────────────────────── */

export interface PointsBurstProps {
  points: number;
  taskName: string;
  combo: number; // 1 = first task, 2+ shows combo
  onComplete: () => void; // called when animation finishes
}

/* ─── Particle Config ──────────────────────────────────────────────────── */

const PARTICLE_COUNT = 8;

interface Particle {
  angle: number;
  distance: number;
  size: number;
  delay: number;
}

function generateParticles(): Particle[] {
  return Array.from({ length: PARTICLE_COUNT }, (_, i) => ({
    angle: (360 / PARTICLE_COUNT) * i + (Math.random() * 20 - 10),
    distance: 60 + Math.random() * 50,
    size: 4 + Math.random() * 4,
    delay: Math.random() * 0.08,
  }));
}

/* ─── Component ────────────────────────────────────────────────────────── */

export default function PointsBurst({
  points,
  taskName,
  combo,
  onComplete,
}: PointsBurstProps) {
  const particles = useMemo(generateParticles, []);

  useEffect(() => {
    const timer = setTimeout(onComplete, 850);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <AnimatePresence>
      <motion.div
        key="burst-overlay"
        style={{
          position: "fixed",
          inset: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          pointerEvents: "none",
          zIndex: 9999,
        }}
        initial={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        {/* ── Particles ─────────────────────────────────────────────── */}
        {particles.map((p, i) => {
          const rad = (p.angle * Math.PI) / 180;
          const tx = Math.cos(rad) * p.distance;
          const ty = Math.sin(rad) * p.distance;
          return (
            <motion.div
              key={i}
              style={{
                position: "absolute",
                width: p.size,
                height: p.size,
                borderRadius: "50%",
                backgroundColor: tokens.color.accent,
              }}
              initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
              animate={{
                x: tx,
                y: ty,
                opacity: 0,
                scale: 0.2,
              }}
              transition={{
                duration: 0.6,
                delay: p.delay,
                ease: "easeOut",
              }}
            />
          );
        })}

        {/* ── Points text pill ──────────────────────────────────────── */}
        <motion.div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 4,
          }}
          initial={{ y: 20, opacity: 0, scale: 0.5 }}
          animate={{ y: -30, opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{
            type: "spring",
            stiffness: 400,
            damping: 12,
            mass: 0.8,
          }}
        >
          <motion.div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              padding: "8px 18px",
              borderRadius: tokens.radius.pill,
              background: "rgba(22, 20, 37, 0.92)",
              border: `2px solid ${tokens.color.accent}`,
              boxShadow: `0 0 24px ${tokens.color.accentSoft}, ${tokens.elevation.mid}`,
              fontFamily: tokens.typography.fontFamily,
            }}
            animate={{ scale: [1, 1.08, 1] }}
            transition={{ duration: 0.3, delay: 0.15 }}
          >
            <span
              style={{
                fontSize: 22,
                fontWeight: 800,
                color: tokens.color.ink,
                letterSpacing: "-0.02em",
              }}
            >
              +{points}
            </span>
            <span
              style={{
                fontSize: 15,
                fontWeight: 600,
                color: tokens.color.accentInk,
                maxWidth: 180,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {taskName}!
            </span>

            {combo >= 2 && (
              <motion.span
                style={{
                  fontSize: 16,
                  fontWeight: 800,
                  color: tokens.color.accent,
                  marginLeft: 2,
                }}
                initial={{ scale: 0, rotate: -20 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{
                  type: "spring",
                  stiffness: 500,
                  damping: 10,
                  delay: 0.1,
                }}
              >
                x{combo}!
              </motion.span>
            )}
          </motion.div>
        </motion.div>

        {/* ── Fade-out ring ─────────────────────────────────────────── */}
        <motion.div
          style={{
            position: "absolute",
            width: 120,
            height: 120,
            borderRadius: "50%",
            border: `2px solid ${tokens.color.accent}`,
          }}
          initial={{ scale: 0.3, opacity: 0.8 }}
          animate={{ scale: 2.2, opacity: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        />
      </motion.div>
    </AnimatePresence>
  );
}
