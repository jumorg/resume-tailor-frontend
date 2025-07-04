import { useState, useCallback, useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ResumeVersion, EditRequest, EditHistoryItem } from '@/types/resume.types';
import { mockResumeService } from '@/services/resume.service.mock'; // Fixed import path
import { useDebounce } from './useDebounce';

interface UseResumeEditorReturn {
  resumeContent: ResumeVersion | null;
  versions: ResumeVersion[];
  isLoading: boolean;
  error: string | null;
  editHistory: EditHistoryItem[];
  selectedSectionId: string | null;
  editPrompt: string;
  isProcessing: boolean;
  editCount: number;
  handleSectionSelect: (sectionId: string) => void;
  handleEditSubmit: (newText: string, prompt?: string) => Promise<void>;
  handlePromptChange: (prompt: string) => void;
  handleVersionSelect: (versionId: string) => Promise<void>;
  handleUndo: () => Promise<void>;
  refreshContent: () => Promise<void>;
}

export function useResumeEditor(): UseResumeEditorReturn {
  const { resumeId } = useParams<{ resumeId: string }>();
  const navigate = useNavigate();
  
  const [resumeContent, setResumeContent] = useState<ResumeVersion | null>(null);
  const [versions, setVersions] = useState<ResumeVersion[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editHistory, setEditHistory] = useState<EditHistoryItem[]>([]);
  const [selectedSectionId, setSelectedSectionId] = useState<string | null>(null);
  const [editPrompt, setEditPrompt] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  
  const debouncedPrompt = useDebounce(editPrompt, 1000);
  const previousVersionRef = useRef<ResumeVersion | null>(null);

  // Load initial content
  useEffect(() => {
    if (!resumeId) {
      navigate('/dashboard');
      return;
    }

    loadResumeContent();
    loadVersionHistory();
  }, [resumeId, navigate]);

  const loadResumeContent = async () => {
    if (!resumeId) return;
    
    try {
      setIsLoading(true);
      setError(null);
      const content = await mockResumeService.getResumeContent(resumeId);
      setResumeContent(content);
      previousVersionRef.current = content;
    } catch (err) {
      setError('Failed to load resume content');
      console.error('Error loading resume:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const loadVersionHistory = async () => {
    if (!resumeId) return;
    
    try {
      const history = await mockResumeService.getVersionHistory(resumeId);
      setVersions(history);
    } catch (err) {
      console.error('Error loading version history:', err);
    }
  };

  const handleSectionSelect = useCallback((sectionId: string) => {
    setSelectedSectionId(sectionId);
    setEditPrompt(''); // Reset prompt when selecting new section
  }, []);

  const handleEditSubmit = async (newText: string, prompt?: string) => {
    if (!resumeId || !selectedSectionId || !resumeContent) return;
    
    try {
      setIsProcessing(true);
      
      // Find the current section
      const section = resumeContent.sections.find(s => s.id === selectedSectionId);
      if (!section) throw new Error('Section not found');
      
      // If prompt provided, enhance text first
      let finalText = newText;
      if (prompt) {
        finalText = await mockResumeService.enhanceText(newText, prompt);
      }
      
      // Save the edit
      const editRequest: EditRequest = {
        sectionId: selectedSectionId,
        originalText: section.content,
        newText: finalText,
        prompt,
      };
      
      const updatedContent = await mockResumeService.saveEdit(resumeId, editRequest);
      
      // Update state
      setResumeContent(updatedContent);
      
      // Add to edit history
      const historyItem: EditHistoryItem = {
        id: `edit-${Date.now()}`,
        sectionId: selectedSectionId,
        oldText: section.content,
        newText: finalText,
        timestamp: new Date(),
      };
      setEditHistory(prev => [...prev, historyItem]);
      
      // Clear selection
      setSelectedSectionId(null);
      setEditPrompt('');
      
      // Reload version history
      await loadVersionHistory();
      
    } catch (err) {
      setError('Failed to save edit');
      console.error('Error saving edit:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePromptChange = useCallback((prompt: string) => {
    setEditPrompt(prompt);
  }, []);

  const handleVersionSelect = async (versionId: string) => {
    if (!resumeId) return;
    
    try {
      setIsLoading(true);
      const version = await mockResumeService.revertToVersion(resumeId, versionId);
      setResumeContent(version);
      await loadVersionHistory();
    } catch (err) {
      setError('Failed to load version');
      console.error('Error loading version:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUndo = async () => {
    if (!resumeId || editHistory.length === 0) return;
    
    const lastEdit = editHistory[editHistory.length - 1];
    
    try {
      setIsProcessing(true);
      
      // Revert the last edit
      const editRequest: EditRequest = {
        sectionId: lastEdit.sectionId,
        originalText: lastEdit.newText,
        newText: lastEdit.oldText,
      };
      
      const updatedContent = await mockResumeService.saveEdit(resumeId, editRequest);
      setResumeContent(updatedContent);
      
      // Remove from history
      setEditHistory(prev => prev.slice(0, -1));
      
      await loadVersionHistory();
      
    } catch (err) {
      setError('Failed to undo edit');
      console.error('Error undoing edit:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  const refreshContent = async () => {
    await loadResumeContent();
    await loadVersionHistory();
  };

  return {
    resumeContent,
    versions,
    isLoading,
    error,
    editHistory,
    selectedSectionId,
    editPrompt: debouncedPrompt,
    isProcessing,
    editCount: resumeContent?.editCount || 0,
    handleSectionSelect,
    handleEditSubmit,
    handlePromptChange,
    handleVersionSelect,
    handleUndo,
    refreshContent,
  };
}