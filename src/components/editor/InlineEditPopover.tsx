import { useState, useRef, useEffect } from 'react';
import { X } from 'react-feather';

interface InlineEditPopoverProps {
  position: { top: number; left: number };
  selectedText: string;
  isProcessing: boolean;
  onSubmit: (prompt: string) => Promise<void>;
  onClose: () => void;
}

export default function InlineEditPopover({
  position,
  selectedText,
  isProcessing,
  onSubmit,
  onClose,
}: InlineEditPopoverProps) {
  const [prompt, setPrompt] = useState('');
  const popoverRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim() || isProcessing) return;
    
    await onSubmit(prompt);
  };

  const quickActions = [
    { label: 'Make more impactful', value: 'more impactful' },
    { label: 'Add metrics', value: 'quantify' },
    { label: 'Use action verbs', value: 'action verbs' },
  ];

  return (
    <div
      ref={popoverRef}
      className="absolute z-50 bg-white rounded-lg shadow-xl border border-gray-200 p-4 w-80"
      style={{ top: position.top, left: position.left, transform: 'translateX(-50%)' }}
    >
      <div className="flex justify-between items-start mb-3">
        <h3 className="font-semibold text-sm text-gray-900">Edit Text</h3>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600 transition-colors"
          aria-label="Close"
        >
          <X size={16} />
        </button>
      </div>

      <div className="mb-3 p-2 bg-gray-50 rounded text-sm text-gray-700 max-h-20 overflow-y-auto">
        "{selectedText}"
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <input
            ref={inputRef}
            type="text"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="How should I improve this text?"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            disabled={isProcessing}
          />
        </div>

        <div className="flex flex-wrap gap-2">
          {quickActions.map((action) => (
            <button
              key={action.value}
              type="button"
              onClick={() => onSubmit(action.value)}
              className="text-xs px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded transition-colors"
              disabled={isProcessing}
            >
              {action.label}
            </button>
          ))}
        </div>

        <button
          type="submit"
          disabled={!prompt.trim() || isProcessing}
          className="w-full py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-300 transition-colors text-sm font-medium"
        >
          {isProcessing ? 'Processing...' : 'Apply Edit'}
        </button>
      </form>
    </div>
  );
}