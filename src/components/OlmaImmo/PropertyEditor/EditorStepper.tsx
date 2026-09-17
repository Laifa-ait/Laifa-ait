import React from 'react';
import { Check } from 'lucide-react';

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
    <div className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-200 shadow-xs">
      <div className="flex items-center justify-between gap-1.5 overflow-x-auto pb-1 scrollbar-none">
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
                  ? 'bg-[#1E3A8A] text-white shadow-xs'
                  : isPassed
                  ? 'bg-blue-50 text-[#1E3A8A] hover:bg-blue-100'
                  : 'bg-transparent text-slate-400 hover:bg-slate-50'
              }`}
              aria-current={isCurrent ? 'step' : undefined}
            >
              <span
                className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black ${
                  isCurrent
                    ? 'bg-[#F59E0B] text-slate-900'
                    : isPassed
                    ? 'bg-[#1E3A8A] text-white'
                    : 'bg-slate-100 text-slate-400'
                }`}
              >
                {isPassed ? <Check className="w-3 h-3 stroke-[3]" /> : step.id}
              </span>
              <span className="hidden sm:inline">{step.title}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

