import React from 'react';

export interface StepItem {
  id: number;
  title: string;
  short: string;
}

interface EditorStepperProps {
  steps: StepItem[];
  currentStep: number;
  onStepClick: (stepId: number) => void;
}

export const EditorStepper: React.FC<EditorStepperProps> = ({
  steps,
  currentStep,
  onStepClick,
}) => {
  return (
    <div className="bg-white rounded-3xl p-4 sm:p-5 border border-[#e8e2d4] shadow-xs">
      <div className="flex items-center justify-between gap-1 overflow-x-auto pb-1 scrollbar-none">
        {steps.map((step) => {
          const isPassed = step.id < currentStep;
          const isCurrent = step.id === currentStep;

          return (
            <button
              key={step.id}
              type="button"
              onClick={() => onStepClick(step.id)}
              className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition cursor-pointer shrink-0 ${
                isCurrent
                  ? 'bg-[#1a3831] text-[#ebdcb8] shadow-xs'
                  : isPassed
                  ? 'bg-[#f4ecd8] text-[#1a3831]'
                  : 'bg-transparent text-slate-400 hover:bg-[#faf8f5]'
              }`}
            >
              <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black ${
                isCurrent
                  ? 'bg-[#ebdcb8] text-[#1a3831]'
                  : isPassed
                  ? 'bg-[#1a3831] text-[#ebdcb8]'
                  : 'bg-slate-100 text-slate-400'
              }`}>
                {step.id}
              </span>
              <span className="hidden sm:inline">{step.title}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
