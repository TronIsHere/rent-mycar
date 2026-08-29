type Step = {
  id: string;
  label: string;
};

type StepIndicatorProps = {
  steps: Step[];
  currentStep: string;
};

export function StepIndicator({ steps, currentStep }: StepIndicatorProps) {
  const currentIndex = steps.findIndex((step) => step.id === currentStep);

  return (
    <div
      className="grid grid-cols-3 gap-px border-2 border-border bg-border"
      role="list"
      aria-label="مراحل ثبت پیشنهاد"
    >
      {steps.map((step, index) => {
        const isComplete = index < currentIndex;
        const isCurrent = step.id === currentStep;

        return (
          <div
            key={step.id}
            role="listitem"
            className={`flex flex-col items-center justify-center px-2 py-4 text-center transition-colors duration-300 ${
              isCurrent
                ? "bg-accent text-accent-foreground"
                : isComplete
                  ? "bg-foreground text-background"
                  : "bg-card text-muted-foreground"
            }`}
            aria-current={isCurrent ? "step" : undefined}
          >
            <span className="label-kinetic opacity-70">
              {String(index + 1).padStart(2, "0")}
            </span>
            <span className="mt-1 text-xs font-bold md:text-sm">{step.label}</span>
          </div>
        );
      })}
    </div>
  );
}
