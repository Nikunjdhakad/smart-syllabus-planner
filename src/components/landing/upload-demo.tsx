"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Upload } from "lucide-react";
import { ROUTES } from "@/lib/constants";

export function UploadDemo() {
  return (
    <section id="demo" className="relative z-10 py-16 sm:py-20">
      <div className="mx-auto max-w-2xl px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.6 }}
        >
          <Link href={ROUTES.register} className="group block">
            {/* Animated gradient border wrapper */}
            <div className="relative overflow-hidden rounded-2xl p-[2px]">
              {/* Rotating gradient border */}
              <div className="hero-upload-border absolute inset-0 rounded-2xl" />

              {/* Inner content */}
              <div className="relative flex flex-col items-center gap-4 rounded-2xl bg-background px-8 py-14 text-center transition-all duration-300 group-hover:bg-muted/50 dark:bg-[#0D0E26]">
                {/* Upload icon with animation */}
                <motion.div
                  className="flex size-16 items-center justify-center rounded-2xl bg-violet-500/10 text-violet-500 dark:bg-violet-500/15 dark:text-violet-400"
                  animate={{ y: [0, -6, 0] }}
                  transition={{
                    duration: 2.5,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                >
                  <Upload className="size-7" strokeWidth={1.8} />
                </motion.div>

                <div>
                  <p className="text-lg font-semibold text-foreground sm:text-xl">
                    Drop Your Syllabus Here
                  </p>
                  <p className="mt-1.5 text-sm text-muted-foreground">
                    PDF, image, or paste text — AI does the rest
                  </p>
                </div>

                {/* File type badges */}
                <div className="flex gap-2">
                  {[".PDF", ".PNG", ".JPG", ".TXT"].map((ext) => (
                    <span
                      key={ext}
                      className="rounded-md border border-border bg-muted/50 px-2.5 py-1 text-[10px] font-mono font-medium text-muted-foreground transition-colors group-hover:border-violet-500/30 group-hover:text-violet-500 dark:group-hover:text-violet-400"
                    >
                      {ext}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
