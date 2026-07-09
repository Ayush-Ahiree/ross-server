"use client";

import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { IconAlertTriangle, IconArrowLeft, IconLayoutDashboard } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  const router = useRouter();

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4 relative overflow-hidden">
      {/* Decorative gradients */}
      <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] bg-primary/10 rounded-full blur-3xl -z-10" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-3xl -z-10" />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 80, damping: 15 }}
        className="w-full max-w-lg z-10"
      >
        <div className="bg-card/50 backdrop-blur-xl border border-border/80 rounded-3xl p-8 text-center shadow-2xl relative overflow-hidden">
          {/* Logo placeholder/header */}
          <div className="flex justify-center mb-6">
            <span className="text-xs font-bold uppercase tracking-[0.25em] text-primary/80 bg-primary/10 px-3 py-1 rounded-full border border-primary/20">
              MATUR.ai
            </span>
          </div>

          <div className="mx-auto w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mb-6 border border-destructive/20">
            <IconAlertTriangle className="w-8 h-8 text-destructive" />
          </div>

          <h1 className="text-4xl font-extrabold tracking-tight bg-gradient-to-r from-foreground via-primary-light to-primary bg-clip-text text-transparent mb-4 sm:text-5xl">
            404
          </h1>
          <h2 className="text-xl font-bold text-foreground mb-3">
            Page Not Found
          </h2>

          <p className="text-muted-foreground mb-8 text-sm sm:text-base leading-relaxed">
            The page you are looking for does not exist, has been moved, or you don't have permission to access it. Let's get you back to safety.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button
              onClick={() => router.push("/dashboard")}
              className="flex items-center gap-2 bg-primary text-primary-foreground hover:bg-primary/95 transition-all font-bold rounded-xl py-6 px-6 shadow-md shadow-primary/20 cursor-pointer"
            >
              <IconLayoutDashboard className="w-4 h-4" />
              Go to Dashboard
            </Button>
            <Button
              onClick={() => router.back()}
              variant="outline"
              className="flex items-center gap-2 border-border text-foreground hover:bg-muted transition-all font-bold rounded-xl py-6 px-6 cursor-pointer"
            >
              <IconArrowLeft className="w-4 h-4" />
              Go Back
            </Button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
