'use client';

import { useState, useEffect, useCallback } from 'react';
import { Document, TodoItem as TodoItemType } from '@/lib/api';
import TodoItem from './TodoItem';
import { v4 as uuidv4 } from 'uuid';

interface TodoEditorProps {
  document: Document;
  onDocumentChange: (doc: Document) => void;
}

export default function TodoEditor({ document, onDocumentChange }: TodoEditorProps) {
  const [todoItems, setTodoItems] = useState<TodoItemType[]>(document.todoItems || []);
  const [newItemId, setNewItemId] = useState<string | null>(null);

  // Initialize with one empty item if the document has no items
  useEffect(() => {
    if (!document.todoItems || document.todoItems.length === 0) {
      const firstItem: TodoItemType = {
        id: uuidv4(),
        description: '',
        checked: false,
        order: 0
      };
      setTodoItems([firstItem]);
      setNewItemId(firstItem.id);
    } else {
      setTodoItems(document.todoItems);
    }
  }, [document.id]); // Only run when document changes

  // Trigger document change with debouncing
  useEffect(() => {
    const timer = setTimeout(() => {
      if (JSON.stringify(todoItems) !== JSON.stringify(document.todoItems)) {
        onDocumentChange({
          ...document,
          todoItems: todoItems
        });
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [todoItems, document, onDocumentChange]);

  const handleAddItem = useCallback(() => {
    const newItem: TodoItemType = {
      id: uuidv4(),
      description: '',
      checked: false,
      order: todoItems.length
    };
    setTodoItems(prev => [...prev, newItem]);
    setNewItemId(newItem.id);
  }, [todoItems.length]);

  const handleUpdateItem = useCallback((id: string, description: string) => {
    setTodoItems(prev =>
      prev.map(item =>
        item.id === id ? { ...item, description } : item
      )
    );
    setNewItemId(null);
  }, []);

  const handleDeleteItem = useCallback((id: string) => {
    setTodoItems(prev => {
      const filtered = prev.filter(item => item.id !== id);
      // Reorder remaining items
      return filtered.map((item, index) => ({ ...item, order: index }));
    });
    setNewItemId(null);
  }, []);

  const handleToggleItem = useCallback((id: string) => {
    setTodoItems(prev =>
      prev.map(item =>
        item.id === id ? { ...item, checked: !item.checked } : item
      )
    );
  }, []);

  const handleEnterPress = useCallback((id: string) => {
    const currentIndex = todoItems.findIndex(item => item.id === id);
    const newItem: TodoItemType = {
      id: uuidv4(),
      description: '',
      checked: false,
      order: currentIndex + 1
    };

    setTodoItems(prev => {
      const newItems = [...prev];
      newItems.splice(currentIndex + 1, 0, newItem);
      // Reorder all items after insertion
      return newItems.map((item, index) => ({ ...item, order: index }));
    });
    setNewItemId(newItem.id);
  }, [todoItems]);

  return (
    <div className="todo-editor-container">
      <div className="todo-list">
        {todoItems.map((item) => (
          <TodoItem
            key={item.id}
            item={item}
            onUpdate={handleUpdateItem}
            onDelete={handleDeleteItem}
            onToggle={handleToggleItem}
            onEnterPress={handleEnterPress}
            autoFocus={item.id === newItemId}
          />
        ))}
      </div>

      <button className="add-todo-button" onClick={handleAddItem}>
        <span>+</span>
        Add Item
      </button>
    </div>
  );
}
