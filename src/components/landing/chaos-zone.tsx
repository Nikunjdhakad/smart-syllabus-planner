"use client";

import { motion } from "framer-motion";
import { FileText, FileSpreadsheet, StickyNote, BookOpen, ClipboardList, Calendar, PenTool, AlertTriangle } from "lucide-react";

interface ChaosZoneProps {
  mouseX: number;
  mouseY: number;
}

const chaosItems = [
  {
    id: "syllabus",
    icon: FileText,
    label: "Syllabus.pdf",
    rotate: -12,
    x: "10%",
    y: "15%",
    floatY: -14,
    duration: 5,
    delay: 0,
    color: "text-violet-400",
    bgAccent: "rgba(167,139,250,0.12)",
  },
  {
    id: "exam",
    icon: Calendar,
    label: "Exam Schedule",
    rotate: 8,
    x: "55%",
    y: "8%",
    floatY: -10,
    duration: 4.5,
    delay: -1.2,
    color: "text-rose-400",
    bgAccent: "rgba(251,113,133,0.12)",
  },
  {
    id: "notes",
    icon: PenTool,
    label: "Chapter Notes",
    rotate: -6,
    x: "25%",
    y: "45%",
    floatY: -16,
    duration: 6,
    delay: -0.8,
    color: "text-amber-400",
    bgAccent: "rgba(252,211,77,0.12)",
  },
  {
    id: "assignment",
    icon: ClipboardList,
    label: "Assignment 3",
    rotate: 15,
    x: "65%",
    y: "38%",
    floatY: -12,
    duration: 5.5,
    delay: -2,
    color: "text-sky-400",
    bgAccent: "rgba(56,189,248,0.12)",
  },
  {
    id: "pdf",
    icon: FileSpreadsheet,
    label: "Unit_4.pdf",
    rotate: -18,
    x: "5%",
    y: "72%",
    floatY: -10,
    duration: 4.8,
    delay: -3,
    color: "text-emerald-400",
    bgAccent: "rgba(52,211,153,0.12)",
  },
  {
    id: "sticky",
    icon: StickyNote,
    label: "STUDY!!",
    rotate: 22,
    x: "50%",
    y: "68%",
    floatY: -8,
    duration: 4,
    delay: -1.5,
    color: "text-yellow-400",
    bgAccent: "rgba(250,204,21,0.15)",
  },
  {
    id: "textbook",
    icon: BookOpen,
    label: "Organic Chem",
    rotate: -4,
    x: "35%",
    y: "82%",
    floatY: -14,
    duration: 5.2,
    delay: -2.5,
    color: "text-indigo-400",
    bgAccent: "rgba(129,140,248,0.12)",
  },
  {
    id: "deadline",
    icon: AlertTriangle,
    label: "Due Tomorrow!",
    rotate: 10,
    x: "70%",
    y: "78%",
    floatY: -11,
    duration: 3.8,
    delay: -0.5,
    color: "text-red-400",
    bgAccent: "rgba(248,113,113,0.15)",
  },
];

const containerVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.12 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, scale: 0.5, y: 30 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { type: "spring", stiffness: 200, damping: 20 },
  },
};

export function ChaosZone({ mouseX, mouseY }: ChaosZoneProps) {
  const parallaxX = mouseX * 15;
  const parallaxY = mouseY * 10;

  return (
    <motion.div
      className="relative h-full w-full"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      style={{
        transform: `translate(${parallaxX}px, ${parallaxY}px)`,
        transition: "transform 0.4s ease-out",
      }}
    >
      {chaosItems.map((item) => {
        const Icon = item.icon;
        return (
          <motion.div
            key={item.id}
            variants={itemVariants}
            className="hero-float absolute"
            style={{
              left: item.x,
              top: item.y,
              "--float-y": `${item.floatY}px`,
              "--float-rotate": `${item.rotate}deg`,
              "--float-duration": `${item.duration}s`,
              "--float-delay": `${item.delay}s`,
              willChange: "transform",
            } as React.CSSProperties}
          >
            <div
              className="hero-glass flex items-center gap-2 rounded-xl px-3 py-2 shadow-lg"
              style={{
                transform: `rotate(${item.rotate}deg)`,
                background: item.bgAccent,
              }}
            >
              <Icon className={`size-4 ${item.color} shrink-0`} strokeWidth={2} />
              <span className="whitespace-nowrap text-[11px] font-medium text-foreground/80 dark:text-white/70">
                {item.label}
              </span>
            </div>
          </motion.div>
        );
      })}
    </motion.div>
  );
}
