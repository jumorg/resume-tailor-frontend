import { useRef, useState, useEffect } from 'react';
import { ResumeSection } from '@/types/resume.types';
import { getTextSelection, clearSelection } from '@/utils/text-selection.utils';
import InlineEditPopover from './InlineEditPopover';
import './ResumeCanvas.css';

interface ResumeCanvasProps {
  sections: ResumeSection[];
  selectedSectionId: string | null;
  isProcessing: boolean;
  onSectionSelect: (sectionId: string) => void;
  onEditSubmit: (newText: string, prompt?: string) => Promise<void>;
}

export default function ResumeCanvas({
  sections,
  selectedSectionId,
  isProcessing,
  onSectionSelect,
  onEditSubmit,
}: ResumeCanvasProps) {
  const canvasRef = useRef<HTMLDivElement>(null);
  const [popoverPosition, setPopoverPosition] = useState<{ top: number; left: number } | null>(null);
  const [selectedText, setSelectedText] = useState<string>('');
  const [activeSectionId, setActiveSectionId] = useState<string | null>(null);

  useEffect(() => {
    const handleSelection = () => {
      const selection = getTextSelection();
      if (!selection) {
        setPopoverPosition(null);
        setSelectedText('');
        return;
      }

      // Find which section contains the selection
      const sectionElement = (selection.range.commonAncestorContainer as Node)
        .parentElement?.closest('[data-section-id]');
      
      if (!sectionElement) return;

      const sectionId = sectionElement.getAttribute('data-section-id');
      const section = sections.find(s => s.id === sectionId);
      
      if (!section?.isEditable) {
        clearSelection();
        return;
      }

      setSelectedText(selection.text);
      setActiveSectionId(sectionId);
      setPopoverPosition({
        top: selection.rect.bottom + window.scrollY + 10,
        left: selection.rect.left + (selection.rect.width / 2),
      });
    };

    document.addEventListener('mouseup', handleSelection);
    document.addEventListener('keyup', handleSelection);

    return () => {
      document.removeEventListener('mouseup', handleSelection);
      document.removeEventListener('keyup', handleSelection);
    };
  }, [sections]);

  const handlePopoverClose = () => {
    setPopoverPosition(null);
    setSelectedText('');
    setActiveSectionId(null);
    clearSelection();
  };

  const handleEditRequest = async (prompt: string) => {
    if (!activeSectionId || !selectedText) return;
    
    onSectionSelect(activeSectionId);
    await onEditSubmit(selectedText, prompt);
    handlePopoverClose();
  };

  const renderSection = (section: ResumeSection) => {
    const isSelected = selectedSectionId === section.id;
    const className = `resume-section resume-section--${section.type} ${
      section.isEditable ? 'resume-section--editable' : ''
    } ${isSelected ? 'resume-section--selected' : ''}`;

    const handleClick = () => {
      if (section.isEditable) {
        onSectionSelect(section.id);
      }
    };

    return (
      <div
        key={section.id}
        data-section-id={section.id}
        className={className}
        onClick={handleClick}
      >
        {section.content.split('\n').map((line, idx) => (
          <div key={idx} className="resume-line">
            {line || '\u00A0'}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="resume-canvas" ref={canvasRef}>
      <div className="resume-paper">
        {sections.map(renderSection)}
      </div>
      
      {popoverPosition && selectedText && (
        <InlineEditPopover
          position={popoverPosition}
          selectedText={selectedText}
          isProcessing={isProcessing}
          onSubmit={handleEditRequest}
          onClose={handlePopoverClose}
        />
      )}
    </div>
  );
}