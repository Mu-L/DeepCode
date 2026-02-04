import { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, Button } from '../components/common';
import { FileUploader, UrlInput } from '../components/input';
import { ProgressTracker, CodeStreamViewer } from '../components/streaming';
import { WorkflowCanvas } from '../components/workflow';
import { FileTree } from '../components/results';
import { useWorkflowStore } from '../stores/workflowStore';
import { useStreaming } from '../hooks/useStreaming';
import { workflowsApi } from '../services/api';
import { toast } from '../components/common/Toaster';
import { PAPER_TO_CODE_STEPS } from '../types/workflow';

type InputMethod = 'file' | 'url';

export default function PaperToCodePage() {
  const [inputMethod, setInputMethod] = useState<InputMethod>('file');
  const [uploadedFilePath, setUploadedFilePath] = useState<string | null>(null);
  const [enableIndexing, setEnableIndexing] = useState(true);

  const {
    activeTaskId,
    status,
    progress,
    message,
    steps,
    streamedCode,
    currentFile,
    generatedFiles,
    setActiveTask,
    setSteps,
    reset,
  } = useWorkflowStore();

  const { isConnected } = useStreaming(activeTaskId);

  const handleStart = async (inputSource: string, inputType: 'file' | 'url') => {
    try {
      reset();
      setSteps(PAPER_TO_CODE_STEPS);

      const response = await workflowsApi.startPaperToCode(
        inputSource,
        inputType,
        enableIndexing
      );

      setActiveTask(response.task_id);
      toast.info('Workflow started', 'Processing your paper...');
    } catch (error) {
      toast.error('Failed to start workflow', 'Please try again');
      console.error('Start error:', error);
    }
  };

  const handleFileUploaded = (_fileId: string, path: string) => {
    setUploadedFilePath(path);
  };

  const handleUrlSubmit = (url: string) => {
    handleStart(url, 'url');
  };

  const handleStartWithFile = () => {
    if (uploadedFilePath) {
      handleStart(uploadedFilePath, 'file');
    }
  };

  const isRunning = status === 'running';
  const currentStepIndex = steps.findIndex((s) => s.status === 'active');

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-2xl font-bold text-gray-900">Paper to Code</h1>
        <p className="text-gray-500 mt-1">
          Upload a research paper and convert it to a working implementation
        </p>
      </motion.div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left Column - Input */}
        <div className="lg:col-span-1 space-y-6">
          <Card>
            <h3 className="font-semibold text-gray-900 mb-4">Input Source</h3>

            {/* Input Method Tabs */}
            <div className="flex space-x-2 mb-4">
              <button
                onClick={() => setInputMethod('file')}
                className={`flex-1 px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                  inputMethod === 'file'
                    ? 'bg-primary-50 text-primary-600'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                Upload PDF
              </button>
              <button
                onClick={() => setInputMethod('url')}
                className={`flex-1 px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                  inputMethod === 'url'
                    ? 'bg-primary-50 text-primary-600'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                URL Link
              </button>
            </div>

            {/* Input Components */}
            {inputMethod === 'file' ? (
              <div className="space-y-4">
                <FileUploader onFileUploaded={handleFileUploaded} />
                {uploadedFilePath && (
                  <Button
                    onClick={handleStartWithFile}
                    isLoading={isRunning}
                    className="w-full"
                  >
                    Start Processing
                  </Button>
                )}
              </div>
            ) : (
              <UrlInput onSubmit={handleUrlSubmit} isLoading={isRunning} />
            )}

            {/* Options */}
            <div className="mt-6 pt-4 border-t border-gray-100">
              <label className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={enableIndexing}
                  onChange={(e) => setEnableIndexing(e.target.checked)}
                  className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
                />
                <span className="text-sm text-gray-700">
                  Enable code indexing
                </span>
              </label>
              <p className="text-xs text-gray-400 mt-1 ml-7">
                Improves code quality but takes longer
              </p>
            </div>
          </Card>

          {/* Progress */}
          {status !== 'idle' && (
            <Card>
              <ProgressTracker steps={steps} currentProgress={progress} />
            </Card>
          )}
        </div>

        {/* Right Column - Results */}
        <div className="lg:col-span-2 space-y-6">
          {/* Workflow Canvas */}
          {status !== 'idle' && steps.length > 0 && (
            <WorkflowCanvas
              steps={steps}
              currentStepIndex={currentStepIndex}
            />
          )}

          {/* Code Stream */}
          <CodeStreamViewer
            code={streamedCode}
            currentFile={currentFile}
            isStreaming={isRunning}
          />

          {/* Generated Files */}
          {generatedFiles.length > 0 && (
            <FileTree files={generatedFiles} />
          )}
        </div>
      </div>
    </div>
  );
}
