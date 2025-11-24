'use client';

import { useState, useRef, useEffect } from 'react';
import { Document } from '@/lib/api';
import TagInput from './TagInput';
import TodoEditor from './TodoEditor';

interface EditorProps {
  document: Document;
  allTags: string[];
  onDocumentChange: (doc: Document) => void;
}

export default function Editor({
  document,
  allTags,
  onDocumentChange
}: EditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (editorRef.current && !isEditing && document.type === 'normal') {
      editorRef.current.innerHTML = document.content || '';
    }
  }, [document.content, document.type, isEditing]);

  const handleTitleChange = (title: string) => {
    onDocumentChange({ ...document, title });
  };

  const handleContentChange = () => {
    if (editorRef.current) {
      const newContent = editorRef.current.innerHTML;
      onDocumentChange({ ...document, content: newContent });
    }
  };

  const handleTagsChange = (tags: string[]) => {
    onDocumentChange({ ...document, tags });
  };

  const handleInput = () => {
    setIsEditing(true);
    handleContentChange();
  };

  const handleBlur = () => {
    setIsEditing(false);
    handleContentChange();
  };

  return (
    <div className="editor-container">
      <input
        type="text"
        className="document-title"
        value={document.title}
        onChange={(e) => handleTitleChange(e.target.value)}
        placeholder="Untitled Document"
      />
      <TagInput
        tags={document.tags || []}
        allTags={allTags}
        onChange={handleTagsChange}
      />

      {document.type === 'todo' ? (
        <TodoEditor document={document} onDocumentChange={onDocumentChange} />
      ) : (
        <div
          ref={editorRef}
          className="editor"
          contentEditable
          onInput={handleInput}
          onBlur={handleBlur}
          suppressContentEditableWarning={true}
          data-placeholder="Start typing your document..."
        />
      )}
    </div>
  );
}