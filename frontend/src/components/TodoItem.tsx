'use client';

import { useState, useRef, useEffect } from 'react';
import { TodoItem as TodoItemType } from '@/lib/api';

interface TodoItemProps {
  item: TodoItemType;
  onUpdate: (id: string, description: string) => void;
  onDelete: (id: string) => void;
  onToggle: (id: string) => void;
  onEnterPress: (id: string) => void;
  autoFocus?: boolean;
}

export default function TodoItem({
  item,
  onUpdate,
  onDelete,
  onToggle,
  onEnterPress,
  autoFocus
}: TodoItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [description, setDescription] = useState(item.description);
  const inputRef = useRef<HTMLInputElement>(null);
  const [showDelete, setShowDelete] = useState(false);

  useEffect(() => {
    if (autoFocus && inputRef.current) {
      inputRef.current.focus();
    }
  }, [autoFocus]);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleDescriptionClick = () => {
    setIsEditing(true);
  };

  const handleDescriptionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDescription(e.target.value);
  };

  const handleBlur = () => {
    setIsEditing(false);
    if (description.trim() !== item.description) {
      onUpdate(item.id, description.trim());
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      setIsEditing(false);
      onUpdate(item.id, description.trim());
      onEnterPress(item.id);
    } else if ((e.key === 'Delete' || e.key === 'Backspace') && description.trim() === '') {
      e.preventDefault();
      onDelete(item.id);
    } else if (e.key === 'Escape') {
      setDescription(item.description);
      setIsEditing(false);
    }
  };

  const handleCheckboxChange = () => {
    onToggle(item.id);
  };

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete(item.id);
  };

  const handleCheckboxKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === ' ' || e.key === 'Spacebar') {
      e.preventDefault();
      onToggle(item.id);
    }
  };

  return (
    <div
      className="todo-item"
      onMouseEnter={() => setShowDelete(true)}
      onMouseLeave={() => setShowDelete(false)}
    >
      <label className="todo-checkbox-container">
        <input
          type="checkbox"
          checked={item.checked}
          onChange={handleCheckboxChange}
          onKeyDown={handleCheckboxKeyDown}
          className="todo-checkbox"
          aria-label={`Mark "${item.description}" as ${item.checked ? 'incomplete' : 'complete'}`}
        />
        <span className="checkbox-custom" aria-hidden="true">
          {item.checked ? '☑' : '☐'}
        </span>
      </label>

      {isEditing ? (
        <input
          ref={inputRef}
          type="text"
          value={description}
          onChange={handleDescriptionChange}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          className="todo-input"
          aria-label="Edit to-do item"
        />
      ) : (
        <span
          className={`todo-description ${item.checked ? 'checked' : ''}`}
          onClick={handleDescriptionClick}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              handleDescriptionClick();
            }
          }}
          aria-label={`Edit to-do: ${item.description}`}
        >
          {item.description || 'Empty item'}
        </span>
      )}

      <button
        className={`todo-delete ${showDelete ? 'visible' : ''}`}
        onClick={handleDeleteClick}
        aria-label="Delete to-do item"
        tabIndex={showDelete ? 0 : -1}
      >
        ×
      </button>
    </div>
  );
}
