import { create } from 'zustand';
import type {
  WorkflowStatus,
  WorkflowStep,
  WorkflowTask,
  PAPER_TO_CODE_STEPS,
  CHAT_PLANNING_STEPS,
} from '../types/workflow';

interface WorkflowState {
  // Current task
  activeTaskId: string | null;
  status: WorkflowStatus;
  progress: number;
  message: string;

  // Steps
  steps: WorkflowStep[];
  currentStepIndex: number;

  // Streaming data
  streamedCode: string;
  currentFile: string | null;
  generatedFiles: string[];

  // Results
  result: Record<string, unknown> | null;
  error: string | null;

  // Actions
  setActiveTask: (taskId: string | null) => void;
  setStatus: (status: WorkflowStatus) => void;
  updateProgress: (progress: number, message: string) => void;
  setSteps: (steps: WorkflowStep[]) => void;
  updateStepStatus: (stepId: string, status: WorkflowStep['status']) => void;
  appendStreamedCode: (chunk: string) => void;
  setCurrentFile: (filename: string | null) => void;
  addGeneratedFile: (filename: string) => void;
  setResult: (result: Record<string, unknown> | null) => void;
  setError: (error: string | null) => void;
  reset: () => void;
}

const initialState = {
  activeTaskId: null,
  status: 'idle' as WorkflowStatus,
  progress: 0,
  message: '',
  steps: [],
  currentStepIndex: -1,
  streamedCode: '',
  currentFile: null,
  generatedFiles: [],
  result: null,
  error: null,
};

export const useWorkflowStore = create<WorkflowState>((set, get) => ({
  ...initialState,

  setActiveTask: (taskId) => set({ activeTaskId: taskId }),

  setStatus: (status) => {
    console.log('[workflowStore] setStatus:', status);
    set({ status });
  },

  updateProgress: (progress, message) => {
    const { steps } = get();

    // Find current step based on progress
    let currentStepIndex = -1;
    for (let i = steps.length - 1; i >= 0; i--) {
      if (progress >= steps[i].progress) {
        currentStepIndex = i;
        break;
      }
    }

    // Check if workflow is complete (progress >= 100)
    const isComplete = progress >= 100;

    // Update step statuses
    const updatedSteps = steps.map((step, index) => ({
      ...step,
      status:
        isComplete
          ? 'completed'  // All steps completed when progress >= 100
          : index < currentStepIndex
          ? 'completed'
          : index === currentStepIndex
          ? 'active'
          : 'pending',
    })) as WorkflowStep[];

    set({
      progress,
      message,
      currentStepIndex: isComplete ? steps.length - 1 : currentStepIndex,
      steps: updatedSteps,
    });
  },

  setSteps: (steps) => set({ steps }),

  updateStepStatus: (stepId, status) => {
    const { steps } = get();
    const updatedSteps = steps.map((step) =>
      step.id === stepId ? { ...step, status } : step
    );
    set({ steps: updatedSteps });
  },

  appendStreamedCode: (chunk) =>
    set((state) => ({
      streamedCode: state.streamedCode + chunk,
    })),

  setCurrentFile: (filename) => set({ currentFile: filename }),

  addGeneratedFile: (filename) =>
    set((state) => ({
      generatedFiles: [...state.generatedFiles, filename],
    })),

  setResult: (result) => {
    console.log('[workflowStore] setResult:', result);
    set({ result });
  },

  setError: (error) => set({ error, status: error ? 'error' : get().status }),

  reset: () => set(initialState),
}));
