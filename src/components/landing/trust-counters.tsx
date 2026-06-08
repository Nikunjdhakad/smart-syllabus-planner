"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useInView } from "framer-motion";
import { Users, CheckSquare, Clock } from "lucide-react";

const stats = [
  { icon: Users, label: "Students Helped", target: 12000, suffix: "+" },
  { icon: CheckSquare, label: "Tasks Completed", target: 50000, suffix: "+" },
  { icon: Clock, label: "Study Hours Planned", target: 100000, suffix: "+" },
];

function AnimatedCounter({ target, suffix, isInView }: { target: number; suffix: string; isInView: boolean }) {
  const [count, setCount] = useState(0);
  const hasAnimated = useRef(false);

  useEffect(() => {
    if (!isInView || hasAnimated.current) return;
    hasAnimated.current = true;

    const duration = 2000;
    const steps = 60;
    const increment = target / steps;
    let current = 0;
    let step = 0;

    const timer = setInterval(() => {
      step++;
      // Ease-out cubic
      const progress = 1 - Math.pow(1 - step / steps, 3);
      current = Math.round(target * progress);
      setCount(current);

      if (step >= steps) {
        setCount(target);
        clearInterval(timer);
      }
    }, duration / steps);

    return () => clearInterval(timer);
  }, [isInView, target]);

  const formatted = count >= 1000 ? `${(count / 1000).toFixed(count >= 10000 ? 0 : 1)}k` : count.toString();

  return (
    <span className="text-gradient-primary text-3xl font-bold tabular-nums sm:text-4xl">
      {formatted}{suffix}
    </span>
  );
}

export function TrustCounters() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section ref={ref} className="relative border-y border-border bg-muted/30 backdrop-blur-sm dark:border-white/8 dark:bg-white/[0.02]">
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-3">
          {stats.map(({ icon: Icon, label, target, suffix }, i) => (
            <motion.div
              key={label}
              className="flex flex-col items-center gap-2 text-center"
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: i * 0.15 }}
            >
              <Icon className="mb-1 size-5 text-violet-500 dark:text-violet-400" strokeWidth={1.8} />
              <AnimatedCounter target={target} suffix={suffix} isInView={isInView} />
              <p className="text-sm text-muted-foreground">{label}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
