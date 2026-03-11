import { useState, useCallback } from 'react';
import { uploadFile, getFileColumns } from '../utils/api.js';

/**
 * Manages file upload lifecycle with FastAPI backend:
 *   idle → scanning (getting columns) → mapping → uploading → ready
 */
export function useFileUpload(onDataReady) {
  const [fileState,    setFileState]    = useState('idle');
  const [fileName,     setFileName]     = useState('');
  const [fileHeaders,  setFileHeaders]  = useState([]);
  const [detectedCols, setDetectedCols] = useState({});
  const [sampleRows,   setSampleRows]   = useState([]);
  const [parseError,   setParseError]   = useState('');
  const [dragging,     setDragging]     = useState(false);
  const [uploadPct,    setUploadPct]    = useState(0);
  const [pendingFile,  setPendingFile]  = useState(null);

  const handleFile = useCallback(async file => {
    if (!file) return;
    setParseError('');
    setFileState('scanning');
    setFileName(file.name);
    setPendingFile(file);

    try {
      // Step 1: lightweight scan — get headers & detected columns only
      const { headers, detected, sample } = await getFileColumns(file);
      setFileHeaders(headers);
      setDetectedCols(detected);
      setSampleRows(sample || []);
      setFileState('mapping');
    } catch (e) {
      setParseError(`Could not read file: ${e.message}`);
      setFileState('idle');
    }
  }, []);

  const onDrop = useCallback(e => {
    e.preventDefault(); setDragging(false);
    handleFile(e.dataTransfer.files[0]);
  }, [handleFile]);

  const applyMapping = useCallback(async colMap => {
    if (!pendingFile) return;
    setFileState('uploading');
    setUploadPct(0);

    // Simulate progress while waiting for backend
    const interval = setInterval(() => setUploadPct(p => Math.min(p + 8, 85)), 200);

    try {
      const data = await uploadFile(pendingFile, colMap);
      clearInterval(interval);
      setUploadPct(100);
      onDataReady(data);
      setFileState('ready');
    } catch (e) {
      clearInterval(interval);
      setParseError(`Processing failed: ${e.message}`);
      setFileState('mapping');
      setUploadPct(0);
    }
  }, [pendingFile, onDataReady]);

  const clearFile = useCallback(() => {
    setFileState('idle'); setFileName(''); setFileHeaders([]);
    setDetectedCols({}); setSampleRows([]); setParseError('');
    setUploadPct(0); setPendingFile(null);
    onDataReady(null);
  }, [onDataReady]);

  return {
    fileState, fileName, fileHeaders, detectedCols, sampleRows,
    parseError, dragging, uploadPct, setDragging,
    handleFile, onDrop, applyMapping, clearFile,
  };
}
