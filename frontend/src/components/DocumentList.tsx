'use client';

import { Document } from '@/lib/api';

type DocumentCategory = 'notDone' | 'done' | 'normal';

interface DocumentListProps {
  documents: Document[];
  selectedDocId?: string;
  onSelectDocument: (id: string) => void;
  onTagClick?: (tag: string) => void;
}

export default function DocumentList({
  documents,
  selectedDocId,
  onSelectDocument,
  onTagClick
}: DocumentListProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleTagClick = (e: React.MouseEvent, tag: string) => {
    e.stopPropagation();
    if (onTagClick) {
      onTagClick(tag);
    }
  };

  const getDocumentIcon = (doc: Document) => {
    if (doc.type === 'todo') {
      return '☑️';
    }
    return '📄';
  };

  const getCompletionStats = (doc: Document) => {
    if (doc.type !== 'todo' || !doc.todoItems) {
      return null;
    }

    const total = doc.todoItems.length;
    const completed = doc.todoItems.filter(item => item.checked).length;
    return `(${completed}/${total} done)`;
  };

  const getDocumentCategory = (doc: Document): DocumentCategory => {
    if (doc.type === 'normal') return 'normal';
    if (doc.type === 'todo') {
      const allChecked = doc.todoItems?.every(item => item.checked);
      return allChecked && doc.todoItems && doc.todoItems.length > 0 ? 'done' : 'notDone';
    }
    return 'normal';
  };

  // Categorize documents
  const categorizedDocuments = {
    notDone: documents.filter(doc => getDocumentCategory(doc) === 'notDone'),
    done: documents.filter(doc => getDocumentCategory(doc) === 'done'),
    normal: documents.filter(doc => getDocumentCategory(doc) === 'normal')
  };

  const renderDocumentItem = (doc: Document) => (
    <div
      key={doc.id}
      className={`document-item ${selectedDocId === doc.id ? 'active' : ''}`}
      onClick={() => onSelectDocument(doc.id)}
    >
      <div className="document-icon">
        {getDocumentIcon(doc)}
      </div>
      <div className="document-info">
        <div className="document-name">
          {doc.title}
          {getCompletionStats(doc) && (
            <span className="completion-stats">{getCompletionStats(doc)}</span>
          )}
        </div>
        <div className="document-date">{formatDate(doc.lastModified)}</div>
        {doc.tags && doc.tags.length > 0 && (
          <div className="document-tags">
            {doc.tags.map((tag, index) => (
              <span
                key={index}
                className="tag-badge"
                onClick={(e) => handleTagClick(e, tag)}
                title="Click to filter by this tag"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="document-list">
      {categorizedDocuments.notDone.length > 0 && (
        <div className="document-category">
          <div className="category-header">
            <span className="category-icon">📋</span>
            <span className="category-title">To-Do - Not Done</span>
            <span className="category-count">({categorizedDocuments.notDone.length})</span>
          </div>
          {categorizedDocuments.notDone.map(renderDocumentItem)}
        </div>
      )}

      {categorizedDocuments.done.length > 0 && (
        <div className="document-category">
          <div className="category-header">
            <span className="category-icon">✅</span>
            <span className="category-title">To-Do - Done</span>
            <span className="category-count">({categorizedDocuments.done.length})</span>
          </div>
          {categorizedDocuments.done.map(renderDocumentItem)}
        </div>
      )}

      {categorizedDocuments.normal.length > 0 && (
        <div className="document-category">
          <div className="category-header">
            <span className="category-icon">📄</span>
            <span className="category-title">Normal Documents</span>
            <span className="category-count">({categorizedDocuments.normal.length})</span>
          </div>
          {categorizedDocuments.normal.map(renderDocumentItem)}
        </div>
      )}

      {documents.length === 0 && (
        <div style={{ padding: '20px', textAlign: 'center', color: '#718096' }}>
          No documents yet
        </div>
      )}
    </div>
  );
}