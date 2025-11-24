'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { api, Document } from '@/lib/api';
import DocumentList from '@/components/DocumentList';
import Editor from '@/components/Editor';
import TagFilter from '@/components/TagFilter';
import DocumentTypeSelector from '@/components/DocumentTypeSelector';
import ThemeToggle from '@/components/ThemeToggle';
import ThemeTransition from '@/components/ThemeTransition';
import { useTheme } from '@/contexts/ThemeContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faTrash } from '@fortawesome/free-solid-svg-icons';

export default function Home() {
  const { theme, isTransitioning } = useTheme();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [selectedDoc, setSelectedDoc] = useState<Document | null>(null);
  const [loading, setLoading] = useState(true);
  const [saveTimeout, setSaveTimeout] = useState<NodeJS.Timeout | null>(null);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [showTypeSelector, setShowTypeSelector] = useState(false);

  const loadDocuments = useCallback(async () => {
    try {
      const docs = await api.getDocuments();
      // Ensure all documents have tags array initialized
      const docsWithTags = docs.map(doc => ({
        ...doc,
        tags: doc.tags || []
      }));
      setDocuments(docsWithTags);

      if (docsWithTags.length > 0 && !selectedDoc) {
        setSelectedDoc(docsWithTags[0]);
      }
    } catch (error) {
      console.error('Failed to load documents:', error);
    } finally {
      setLoading(false);
    }
  }, [selectedDoc]);

  useEffect(() => {
    loadDocuments();
  }, [loadDocuments]);

  const handleCreateDocument = async (type: 'normal' | 'todo') => {
    try {
      const newDoc = await api.createDocument('Untitled Document', type);
      const docWithTags = { ...newDoc, tags: newDoc.tags || [] };
      setDocuments(prev => [docWithTags, ...prev]);
      setSelectedDoc(docWithTags);
      setShowTypeSelector(false);
    } catch (error) {
      console.error('Failed to create document:', error);
    }
  };

  const handleShowTypeSelector = () => {
    setShowTypeSelector(true);
  };

  const handleCancelTypeSelector = () => {
    setShowTypeSelector(false);
  };

  const handleSelectDocument = async (id: string) => {
    // First, set from local state immediately for better UX
    const localDoc = documents.find(d => d.id === id);
    if (localDoc) {
      setSelectedDoc(localDoc);
    }

    // Then fetch the latest version from API in the background
    try {
      const doc = await api.getDocument(id);
      const docWithTags = {
        ...doc,
        tags: doc.tags || []
      };
      setSelectedDoc(docWithTags);
      // Update the documents array with fresh data
      setDocuments(prev =>
        prev.map(d => d.id === id ? docWithTags : d)
      );
    } catch (error) {
      console.error('Failed to load document:', error);
    }
  };

  const handleDeleteDocument = async () => {
    if (!selectedDoc || documents.length <= 1) return;
    
    if (confirm('Are you sure you want to delete this document?')) {
      try {
        await api.deleteDocument(selectedDoc.id);
        const updatedDocs = documents.filter(d => d.id !== selectedDoc.id);
        setDocuments(updatedDocs);
        
        if (updatedDocs.length > 0) {
          setSelectedDoc(updatedDocs[0]);
        } else {
          handleCreateDocument('normal');
        }
      } catch (error) {
        console.error('Failed to delete document:', error);
      }
    }
  };

  // Compute all unique tags from all documents
  const allTags = useMemo(() => {
    const tagSet = new Set<string>();
    documents.forEach(doc => {
      if (doc.tags) {
        doc.tags.forEach(tag => tagSet.add(tag));
      }
    });
    return Array.from(tagSet);
  }, [documents]);

  // Filter documents by selected tags
  const filteredDocuments = useMemo(() => {
    if (selectedTags.length === 0) {
      return documents;
    }
    return documents.filter(doc => {
      if (!doc.tags || doc.tags.length === 0) return false;
      return selectedTags.every(selectedTag => doc.tags.includes(selectedTag));
    });
  }, [documents, selectedTags]);

  const saveDocument = useCallback(async (doc: Document) => {
    try {
      await api.updateDocument(doc.id, doc.title, doc.content, doc.tags || [], doc.todoItems);
      setDocuments(prev =>
        prev.map(d => d.id === doc.id ? { ...doc, lastModified: new Date().toISOString() } : d)
      );
    } catch (error) {
      console.error('Failed to save document:', error);
    }
  }, []);

  const handleDocumentChange = (updatedDoc: Document) => {
    if (!selectedDoc) return;

    setSelectedDoc(updatedDoc);
    setDocuments(prev =>
      prev.map(d => d.id === selectedDoc.id ? updatedDoc : d)
    );

    if (saveTimeout) clearTimeout(saveTimeout);
    setSaveTimeout(setTimeout(() => saveDocument(updatedDoc), 500));
  };

  const handleTagClick = (tag: string) => {
    if (!selectedTags.includes(tag)) {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  const handleFilterTagsChange = (tags: string[]) => {
    setSelectedTags(tags);
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <>
      <ThemeTransition isTransitioning={isTransitioning} theme={theme} />
      <div className="app">
        <aside className="sidebar">
        <div className="sidebar-header">
          <div className="sidebar-header-top">
            <h1>Web Notepad</h1>
            <ThemeToggle />
          </div>
          <button className="btn btn-primary" onClick={handleShowTypeSelector}>
            <FontAwesomeIcon icon={faPlus} />
            New Document
          </button>
        </div>
        <TagFilter
          selectedTags={selectedTags}
          allTags={allTags}
          onTagsChange={handleFilterTagsChange}
        />
        <DocumentList
          documents={filteredDocuments}
          selectedDocId={selectedDoc?.id}
          onSelectDocument={handleSelectDocument}
          onTagClick={handleTagClick}
        />
        {selectedTags.length > 0 && (
          <div className="filter-status">
            Showing {filteredDocuments.length} of {documents.length} documents
          </div>
        )}
      </aside>

      <main className="main-content">
        {selectedDoc ? (
          <>
            <div className="editor-header">
              <div className="editor-title-section">
                <h2>Document Editor</h2>
              </div>
              <button
                className="btn btn-danger"
                onClick={handleDeleteDocument}
                disabled={documents.length <= 1}
              >
                <FontAwesomeIcon icon={faTrash} />
                Delete
              </button>
            </div>
            <Editor
              document={selectedDoc}
              allTags={allTags}
              onDocumentChange={handleDocumentChange}
            />
          </>
        ) : (
          <div className="no-document">
            <p>No document selected</p>
          </div>
        )}
      </main>

      {showTypeSelector && (
        <DocumentTypeSelector
          onTypeSelect={handleCreateDocument}
          onCancel={handleCancelTypeSelector}
        />
      )}
      </div>
    </>
  );
}