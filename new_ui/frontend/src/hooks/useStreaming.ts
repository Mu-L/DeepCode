import { useEffect, useCallback, useState } from 'react';
import { useWebSocket } from './useWebSocket';
import { useWorkflowStore } from '../stores/workflowStore';
import type {
  WSProgressMessage,
  WSCompleteMessage,
  WSErrorMessage,
  WSCodeChunkMessage,
} from '../types/api';

export function useStreaming(taskId: string | null) {
  const {
    updateProgress,
    setStatus,
    setResult,
    setError,
    appendStreamedCode,
    setCurrentFile,
    addGeneratedFile,
  } = useWorkflowStore();

  // Track if workflow is finished to prevent reconnection
  const [isFinished, setIsFinished] = useState(false);

  const handleMessage = useCallback(
    (message: WSProgressMessage | WSCompleteMessage | WSErrorMessage | WSCodeChunkMessage) => {
      console.log('[useStreaming] Received message:', message.type, message);
      
      switch (message.type) {
        case 'progress':
          if ('progress' in message && message.progress !== undefined) {
            updateProgress(message.progress, message.message || '');
          }
          break;

        case 'status':
          // Handle status messages - check if task is already completed
          if ('progress' in message && message.progress !== undefined) {
            updateProgress(message.progress, message.message || '');
          }
          // Check if the status indicates completion (for reconnection after task finished)
          if ('status' in message) {
            const taskStatus = (message as unknown as { status: string }).status;
            if (taskStatus === 'completed') {
              console.log('[useStreaming] Task already completed (from status message)');
              // Don't set finished here - wait for the complete message with result
            } else if (taskStatus === 'error') {
              console.log('[useStreaming] Task already errored (from status message)');
            }
          }
          break;

        case 'complete':
          console.log('[useStreaming] Workflow complete! Setting finished state.');
          console.log('[useStreaming] Result:', JSON.stringify(message.result, null, 2));
          setIsFinished(true);
          setStatus('completed');
          setResult(message.result);
          // Update progress to 100% to mark all steps as complete
          updateProgress(100, 'Workflow completed successfully');
          break;

        case 'error':
          // Only mark as error if it's a real error, not "Task not found"
          if (message.error !== 'Task not found') {
            setIsFinished(true);
            setStatus('error');
            setError(message.error);
          }
          break;

        case 'code_chunk':
          if (message.content) {
            appendStreamedCode(message.content);
          }
          break;

        case 'file_start':
          if (message.filename) {
            setCurrentFile(message.filename);
          }
          break;

        case 'file_end':
          if (message.filename) {
            addGeneratedFile(message.filename);
            setCurrentFile(null);
          }
          break;

        case 'heartbeat':
          // Ignore heartbeat messages
          break;
      }
    },
    [updateProgress, setStatus, setResult, setError, appendStreamedCode, setCurrentFile, addGeneratedFile]
  );

  // Compute effective URL - null if finished to stop WebSocket
  const workflowUrl = taskId && !isFinished ? `/ws/workflow/${taskId}` : null;
  const codeStreamUrl = taskId && !isFinished ? `/ws/code-stream/${taskId}` : null;

  const workflowWs = useWebSocket(workflowUrl, {
    onMessage: handleMessage as (message: unknown) => void,
    reconnect: true,
  });

  const codeStreamWs = useWebSocket(codeStreamUrl, {
    onMessage: handleMessage as (message: unknown) => void,
    reconnect: true,
  });

  // Reset finished state when taskId changes
  useEffect(() => {
    if (taskId) {
      console.log('[useStreaming] useEffect: taskId changed, resetting to running. taskId:', taskId);
      setIsFinished(false);
      setStatus('running');
    }
  }, [taskId, setStatus]);

  return {
    isConnected: workflowWs.isConnected || codeStreamWs.isConnected,
    disconnect: () => {
      setIsFinished(true);
      workflowWs.disconnect();
      codeStreamWs.disconnect();
    },
  };
}
