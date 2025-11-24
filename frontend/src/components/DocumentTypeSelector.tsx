'use client';

import { useEffect, useRef } from 'react';

interface DocumentTypeSelectorProps {
  onTypeSelect: (type: 'normal' | 'todo') => void;
  onCancel: () => void;
}

export default function DocumentTypeSelector({ onTypeSelect, onCancel }: DocumentTypeSelectorProps) {
  const normalButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    // Auto-focus the first option on mount
    normalButtonRef.current?.focus();

    // Handle Escape key to cancel
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onCancel();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onCancel]);

  return (
    <div className="document-type-selector-overlay" onClick={onCancel}>
      <div className="document-type-selector" onClick={(e) => e.stopPropagation()}>
        <h3 className="selector-title">Choose Document Type</h3>
        <div className="type-options">
          <button
            ref={normalButtonRef}
            className="type-option"
            onClick={() => onTypeSelect('normal')}
            aria-label="Create Normal Document"
          >
            <span className="type-icon">📄</span>
            <span className="type-name">Normal</span>
            <span className="type-description">Free-form text notes</span>
          </button>
          <button
            className="type-option"
            onClick={() => onTypeSelect('todo')}
            aria-label="Create To-Do Document"
          >
            <span className="type-icon">☑️</span>
            <span className="type-name">To-Do</span>
            <span className="type-description">Task list with checks</span>
          </button>
        </div>
        <button className="cancel-button" onClick={onCancel}>
          Cancel
        </button>
      </div>
    </div>
  );
}
