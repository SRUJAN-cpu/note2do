'use client';

import { useState, KeyboardEvent, useRef, useEffect } from 'react';

interface TagFilterProps {
  selectedTags: string[];
  allTags: string[];
  onTagsChange: (tags: string[]) => void;
}

export default function TagFilter({ selectedTags, allTags, onTagsChange }: TagFilterProps) {
  const [inputValue, setInputValue] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const availableTags = allTags.filter(tag => !selectedTags.includes(tag));

  const filteredSuggestions = availableTags.filter(tag =>
    tag.toLowerCase().includes(inputValue.toLowerCase().trim())
  ).slice(0, 8);

  const addTag = (tag: string) => {
    const trimmedTag = tag.trim();
    if (trimmedTag && !selectedTags.includes(trimmedTag) && allTags.includes(trimmedTag)) {
      onTagsChange([...selectedTags, trimmedTag]);
      setInputValue('');
      setShowSuggestions(false);
    }
  };

  const removeTag = (tagToRemove: string) => {
    onTagsChange(selectedTags.filter(tag => tag !== tagToRemove));
  };

  const clearAll = () => {
    onTagsChange([]);
    setInputValue('');
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && inputValue.trim()) {
      e.preventDefault();
      if (filteredSuggestions.length > 0) {
        addTag(filteredSuggestions[0]);
      }
    } else if (e.key === 'Backspace' && !inputValue && selectedTags.length > 0) {
      removeTag(selectedTags[selectedTags.length - 1]);
    }
  };

  useEffect(() => {
    if (inputValue.trim() && filteredSuggestions.length > 0) {
      setShowSuggestions(true);
    } else {
      setShowSuggestions(false);
    }
  }, [inputValue, filteredSuggestions.length]);

  return (
    <div className="tag-filter-wrapper">
      <div className="tag-filter-header">
        <span className="filter-label">Filter by tags</span>
        {selectedTags.length > 0 && (
          <button
            className="clear-filters-btn"
            onClick={clearAll}
            aria-label="Clear all filters"
          >
            Clear all
          </button>
        )}
      </div>
      <div className="tag-filter-container">
        <div className="tag-filter-chips">
          {selectedTags.map((tag, index) => (
            <span key={index} className="tag-chip tag-chip-filter">
              {tag}
              <button
                type="button"
                className="tag-remove"
                onClick={() => removeTag(tag)}
                aria-label={`Remove filter ${tag}`}
              >
                ×
              </button>
            </span>
          ))}
          <input
            ref={inputRef}
            type="text"
            className="tag-filter-input"
            placeholder={selectedTags.length === 0 ? "Search tags to filter..." : ""}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={() => inputValue.trim() && setShowSuggestions(true)}
            onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
          />
        </div>
        {showSuggestions && filteredSuggestions.length > 0 && (
          <div className="tag-suggestions tag-suggestions-filter">
            {filteredSuggestions.map((suggestion, index) => (
              <div
                key={index}
                className="tag-suggestion-item"
                onClick={() => addTag(suggestion)}
              >
                {suggestion}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
