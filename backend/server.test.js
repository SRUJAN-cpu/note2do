const request = require('supertest');
const express = require('express');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');

// Mock the server without starting it
const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

let documents = [];

// Copy all routes from server.js
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

// Test Suite
describe('Document API Endpoints', () => {
  beforeEach(() => {
    // Clear documents before each test
    documents = [];
  });

  describe('POST /api/documents', () => {
    it('should create a new normal document', async () => {
      const response = await request(app)
        .post('/api/documents')
        .send({ title: 'Test Document' })
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body.title).toBe('Test Document');
      expect(response.body.type).toBe('normal');
      expect(response.body.content).toBe('');
      expect(response.body.tags).toEqual([]);
    });

    it('should create a new to-do document', async () => {
      const response = await request(app)
        .post('/api/documents')
        .send({
          title: 'My To-Do List',
          type: 'todo'
        })
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body.title).toBe('My To-Do List');
      expect(response.body.type).toBe('todo');
      expect(response.body.todoItems).toEqual([]);
      expect(response.body).not.toHaveProperty('content');
    });

    it('should create a to-do document with items', async () => {
      const todoItems = [
        { id: '1', description: 'Task 1', checked: false, order: 0 },
        { id: '2', description: 'Task 2', checked: true, order: 1 }
      ];

      const response = await request(app)
        .post('/api/documents')
        .send({
          title: 'My To-Do List',
          type: 'todo',
          todoItems
        })
        .expect(201);

      expect(response.body.todoItems).toEqual(todoItems);
    });

    it('should default to normal type if not specified', async () => {
      const response = await request(app)
        .post('/api/documents')
        .send({ title: 'Default Type Doc' })
        .expect(201);

      expect(response.body.type).toBe('normal');
    });

    it('should create document with tags', async () => {
      const response = await request(app)
        .post('/api/documents')
        .send({
          title: 'Tagged Doc',
          tags: ['work', 'urgent']
        })
        .expect(201);

      expect(response.body.tags).toEqual(['work', 'urgent']);
    });
  });

  describe('GET /api/documents', () => {
    it('should return empty array when no documents exist', async () => {
      const response = await request(app)
        .get('/api/documents')
        .expect(200);

      expect(response.body).toEqual([]);
    });

    it('should return all documents', async () => {
      // Create some documents
      await request(app)
        .post('/api/documents')
        .send({ title: 'Doc 1' });

      await request(app)
        .post('/api/documents')
        .send({ title: 'Doc 2', type: 'todo' });

      const response = await request(app)
        .get('/api/documents')
        .expect(200);

      expect(response.body).toHaveLength(2);
    });

    it('should return documents sorted by lastModified (newest first)', async () => {
      const doc1 = await request(app)
        .post('/api/documents')
        .send({ title: 'First' });

      // Small delay to ensure different timestamps
      await new Promise(resolve => setTimeout(resolve, 10));

      const doc2 = await request(app)
        .post('/api/documents')
        .send({ title: 'Second' });

      const response = await request(app)
        .get('/api/documents')
        .expect(200);

      expect(response.body[0].title).toBe('Second');
      expect(response.body[1].title).toBe('First');
    });
  });

  describe('GET /api/documents/:id', () => {
    it('should return a specific document', async () => {
      const createResponse = await request(app)
        .post('/api/documents')
        .send({ title: 'Find Me' });

      const docId = createResponse.body.id;

      const response = await request(app)
        .get(`/api/documents/${docId}`)
        .expect(200);

      expect(response.body.id).toBe(docId);
      expect(response.body.title).toBe('Find Me');
    });

    it('should return 404 for non-existent document', async () => {
      const response = await request(app)
        .get('/api/documents/non-existent-id')
        .expect(404);

      expect(response.body.error).toBe('Document not found');
    });
  });

  describe('PUT /api/documents/:id', () => {
    it('should update document title', async () => {
      const createResponse = await request(app)
        .post('/api/documents')
        .send({ title: 'Original Title' });

      const docId = createResponse.body.id;

      const response = await request(app)
        .put(`/api/documents/${docId}`)
        .send({ title: 'Updated Title' })
        .expect(200);

      expect(response.body.title).toBe('Updated Title');
    });

    it('should update document content for normal documents', async () => {
      const createResponse = await request(app)
        .post('/api/documents')
        .send({ title: 'Doc', content: 'Old content' });

      const docId = createResponse.body.id;

      const response = await request(app)
        .put(`/api/documents/${docId}`)
        .send({ content: 'New content' })
        .expect(200);

      expect(response.body.content).toBe('New content');
    });

    it('should update todoItems for to-do documents', async () => {
      const createResponse = await request(app)
        .post('/api/documents')
        .send({
          title: 'To-Do',
          type: 'todo',
          todoItems: []
        });

      const docId = createResponse.body.id;
      const newItems = [
        { id: '1', description: 'New task', checked: false, order: 0 }
      ];

      const response = await request(app)
        .put(`/api/documents/${docId}`)
        .send({ todoItems: newItems })
        .expect(200);

      expect(response.body.todoItems).toEqual(newItems);
    });

    it('should prevent type changes', async () => {
      const createResponse = await request(app)
        .post('/api/documents')
        .send({ title: 'Normal Doc', type: 'normal' });

      const docId = createResponse.body.id;

      const response = await request(app)
        .put(`/api/documents/${docId}`)
        .send({ type: 'todo' })
        .expect(400);

      expect(response.body.error).toBe('Document type cannot be changed after creation');
    });

    it('should update tags', async () => {
      const createResponse = await request(app)
        .post('/api/documents')
        .send({ title: 'Doc', tags: ['old'] });

      const docId = createResponse.body.id;

      const response = await request(app)
        .put(`/api/documents/${docId}`)
        .send({ tags: ['new', 'tags'] })
        .expect(200);

      expect(response.body.tags).toEqual(['new', 'tags']);
    });

    it('should return 404 for non-existent document', async () => {
      await request(app)
        .put('/api/documents/non-existent-id')
        .send({ title: 'New Title' })
        .expect(404);
    });
  });

  describe('DELETE /api/documents/:id', () => {
    it('should delete a document', async () => {
      const createResponse = await request(app)
        .post('/api/documents')
        .send({ title: 'Delete Me' });

      const docId = createResponse.body.id;

      await request(app)
        .delete(`/api/documents/${docId}`)
        .expect(204);

      // Verify it's deleted
      await request(app)
        .get(`/api/documents/${docId}`)
        .expect(404);
    });

    it('should return 404 when deleting non-existent document', async () => {
      await request(app)
        .delete('/api/documents/non-existent-id')
        .expect(404);
    });
  });

  describe('To-Do Feature Integration Tests', () => {
    it('should handle complete to-do workflow', async () => {
      // Create to-do document
      const createResponse = await request(app)
        .post('/api/documents')
        .send({
          title: 'Shopping List',
          type: 'todo',
          todoItems: [
            { id: '1', description: 'Milk', checked: false, order: 0 },
            { id: '2', description: 'Bread', checked: false, order: 1 }
          ]
        });

      expect(createResponse.status).toBe(201);
      const docId = createResponse.body.id;

      // Check off first item
      const updateResponse = await request(app)
        .put(`/api/documents/${docId}`)
        .send({
          todoItems: [
            { id: '1', description: 'Milk', checked: true, order: 0 },
            { id: '2', description: 'Bread', checked: false, order: 1 }
          ]
        });

      expect(updateResponse.status).toBe(200);
      expect(updateResponse.body.todoItems[0].checked).toBe(true);

      // Add new item
      const addItemResponse = await request(app)
        .put(`/api/documents/${docId}`)
        .send({
          todoItems: [
            { id: '1', description: 'Milk', checked: true, order: 0 },
            { id: '2', description: 'Bread', checked: false, order: 1 },
            { id: '3', description: 'Eggs', checked: false, order: 2 }
          ]
        });

      expect(addItemResponse.status).toBe(200);
      expect(addItemResponse.body.todoItems).toHaveLength(3);
    });

    it('should maintain document type integrity', async () => {
      // Create normal document
      const normalDoc = await request(app)
        .post('/api/documents')
        .send({
          title: 'Normal',
          type: 'normal',
          content: 'Some text'
        });

      // Try to change to todo - should fail
      await request(app)
        .put(`/api/documents/${normalDoc.body.id}`)
        .send({ type: 'todo' })
        .expect(400);

      // Create todo document
      const todoDoc = await request(app)
        .post('/api/documents')
        .send({
          title: 'To-Do',
          type: 'todo'
        });

      // Try to change to normal - should fail
      await request(app)
        .put(`/api/documents/${todoDoc.body.id}`)
        .send({ type: 'normal' })
        .expect(400);
    });
  });
});
