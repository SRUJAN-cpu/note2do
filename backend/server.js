const express = require('express');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

let documents = [];

app.get('/api/documents', (req, res) => {
  const docsWithTags = documents.map(doc => ({
    ...doc,
    tags: doc.tags || []
  }));
  res.json(docsWithTags.sort((a, b) => new Date(b.lastModified) - new Date(a.lastModified)));
});

app.get('/api/documents/:id', (req, res) => {
  const document = documents.find(doc => doc.id === req.params.id);
  if (!document) {
    return res.status(404).json({ error: 'Document not found' });
  }
  res.json({
    ...document,
    tags: document.tags || []
  });
});

app.post('/api/documents', (req, res) => {
  const docType = req.body.type || 'normal';

  const newDocument = {
    id: uuidv4(),
    title: req.body.title || 'Untitled Document',
    type: docType,
    tags: req.body.tags || [],
    lastModified: new Date().toISOString()
  };

  // Initialize type-specific fields
  if (docType === 'todo') {
    newDocument.todoItems = req.body.todoItems || [];
  } else {
    newDocument.content = req.body.content || '';
  }

  documents.push(newDocument);
  res.status(201).json(newDocument);
});

app.put('/api/documents/:id', (req, res) => {
  const documentIndex = documents.findIndex(doc => doc.id === req.params.id);
  if (documentIndex === -1) {
    return res.status(404).json({ error: 'Document not found' });
  }

  // Prevent type changes after document creation
  if (req.body.type && req.body.type !== documents[documentIndex].type) {
    return res.status(400).json({ error: 'Document type cannot be changed after creation' });
  }

  const existingDoc = documents[documentIndex];

  documents[documentIndex] = {
    ...existingDoc,
    title: req.body.title || existingDoc.title,
    tags: req.body.tags !== undefined ? req.body.tags : existingDoc.tags || [],
    lastModified: new Date().toISOString()
  };

  // Update type-specific fields
  if (existingDoc.type === 'todo') {
    documents[documentIndex].todoItems = req.body.todoItems !== undefined ? req.body.todoItems : existingDoc.todoItems;
  } else {
    documents[documentIndex].content = req.body.content !== undefined ? req.body.content : existingDoc.content;
  }

  res.json(documents[documentIndex]);
});

app.delete('/api/documents/:id', (req, res) => {
  const documentIndex = documents.findIndex(doc => doc.id === req.params.id);
  if (documentIndex === -1) {
    return res.status(404).json({ error: 'Document not found' });
  }
  
  documents.splice(documentIndex, 1);
  res.status(204).send();
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});