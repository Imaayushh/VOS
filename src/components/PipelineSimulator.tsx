"use client";

import React, { useState } from "react";
import { PIPELINE_STEPS } from "../data/hardwareSpecs";
import { Play, Pause, ChevronRight, ChevronLeft, Cpu, Terminal, ArrowRight, ShieldCheck, Check, Copy } from "lucide-react";

interface PipelineSimulatorProps {
  currentStepIndex?: number;
  onStepChange?: (index: number) => void;
}

export default function PipelineSimulator({
  currentStepIndex = 0,
  onStepChange,
}: PipelineSimulatorProps) {
  const [activeStep, setActiveStep] = useState(currentStepIndex);
  const [copied, setCopied] = useState(false);

  const step = PIPELINE_STEPS[activeStep];

  const handleSelectStep = (idx: number) => {
    setActiveStep(idx);
    if (onStepChange) onStepChange(idx);
  };

  const handleNext = () => {
    if (activeStep < PIPELINE_STEPS.length - 1) {
      handleSelectStep(activeStep + 1);
    }
  };

  const handlePrev = () => {
    if (activeStep > 0) {
      handleSelectStep(activeStep - 1);
    }
  };

  const copyCode = () => {
    navigator.clipboard.writeText(step.codeSnippet);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="rounded-2xl border border-surfaceBorder bg-surface/80 backdrop-blur-xl p-5 shadow-2xl space-y-5">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 font-mono text-[11px] font-semibold">
              HARDWARE → SOFTWARE INTEGRATION
            </span>
            <span className="text-slate-500 text-xs">•</span>
            <span className="text-slate-400 text-xs">Step {activeStep + 1} of {PIPELINE_STEPS.length}</span>
          </div>
          <h2 className="text-lg font-bold text-white mt-1">
            {step.title}
          </h2>
        </div>

        {/* Step Navigation Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={handlePrev}
            disabled={activeStep === 0}
            className="p-1.5 rounded-lg border border-slate-700 bg-slate-800/80 text-slate-300 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed transition-all"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={handleNext}
            disabled={activeStep === PIPELINE_STEPS.length - 1}
            className="p-1.5 rounded-lg border border-slate-700 bg-slate-800/80 text-slate-300 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed transition-all"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Horizontal Pipeline Stepper Bar */}
      <div className="overflow-x-auto pb-2 -mx-1 px-1">
        <div className="flex items-center gap-1.5 min-w-[720px]">
          {PIPELINE_STEPS.map((s, idx) => {
            const isActive = idx === activeStep;
            const isCompleted = idx < activeStep;
            return (
              <button
                key={s.step}
                onClick={() => handleSelectStep(idx)}
                className={`flex-1 py-2 px-2.5 rounded-xl border text-left transition-all duration-200 flex flex-col justify-between ${
                  isActive
                    ? "bg-cyan-500/15 border-cyan-500 text-white shadow-lg shadow-cyan-950/50"
                    : isCompleted
                    ? "bg-slate-900/60 border-slate-800 text-slate-300 hover:border-slate-700"
                    : "bg-slate-950/40 border-slate-900 text-slate-500 hover:text-slate-400"
                }`}
              >
                <div className="flex items-center justify-between w-full mb-1">
                  <span className={`text-[10px] font-mono font-bold ${isActive ? "text-cyan-400" : isCompleted ? "text-emerald-400" : "text-slate-600"}`}>
                    STEP {s.step}
                  </span>
                  {isCompleted && <Check className="w-3 h-3 text-emerald-400" />}
                </div>
                <div className="text-[11px] font-medium truncate w-full">
                  {s.title.split(" ")[0]} {s.title.split(" ")[1] || ""}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Step Detail Cards (2 Columns: Description & Code Contract) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left Column: Device & Description */}
        <div className="lg:col-span-5 space-y-3">
          <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800 space-y-3">
            <div>
              <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block mb-1">Executing Device / Subsystem:</span>
              <div className="text-sm font-semibold text-cyan-300 flex items-center gap-2">
                <Cpu className="w-4 h-4 text-cyan-400" />
                {step.device}
              </div>
            </div>

            <div>
              <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block mb-1">Communication Protocol / Interface:</span>
              <div className="text-xs font-mono text-emerald-400 bg-slate-950 px-2.5 py-1.5 rounded-lg border border-slate-800">
                {step.protocol}
              </div>
            </div>

            <div>
              <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block mb-1">Technical Operation:</span>
              <p className="text-xs text-slate-300 leading-relaxed">
                {step.description}
              </p>
            </div>
          </div>
        </div>

        {/* Right Column: Code Contract & Payload Terminal */}
        <div className="lg:col-span-7">
          <div className="rounded-xl bg-slate-950 border border-slate-800 overflow-hidden shadow-inner">
            <div className="px-3.5 py-2 bg-slate-900/80 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs text-slate-400 font-mono">
                <Terminal className="w-3.5 h-3.5 text-cyan-400" />
                <span>Python / Hardware Interface Code Contract</span>
              </div>
              <button
                onClick={copyCode}
                className="text-[11px] text-slate-400 hover:text-cyan-300 flex items-center gap-1 transition-colors"
              >
                {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                <span>{copied ? "Copied" : "Copy"}</span>
              </button>
            </div>

            <pre className="p-4 text-xs font-mono text-cyan-200/90 overflow-x-auto leading-relaxed max-h-[220px]">
              <code>{step.codeSnippet}</code>
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}
