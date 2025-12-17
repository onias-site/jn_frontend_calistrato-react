import create from 'zustand';

interface StepperStore {
  currentStep: number;
  maxSteps: number;
  goToStep: (step: number) => void;
  nextStep: () => void;
  previousStep: () => void;
  resetStepper: () => void;
  setMaxSteps: (steps: number) => void;
}

export const useStepperStore = create<StepperStore>((set) => ({
  currentStep: 0,
  maxSteps: 2, // Inicialmente definimos para 2 etapas

  goToStep: (step) => set((state) => ({
    currentStep: step >= 0 && step < state.maxSteps ? step : state.currentStep
  })),

  nextStep: () => set((state) => ({
    currentStep: state.currentStep < state.maxSteps - 1 ? state.currentStep + 1 : state.currentStep
  })),

  previousStep: () => set((state) => ({
    currentStep: state.currentStep > 0 ? state.currentStep - 1 : state.currentStep
  })),

  resetStepper: () => set({ currentStep: 0 }),

  setMaxSteps: (steps) => set({ maxSteps: steps }),
}));
