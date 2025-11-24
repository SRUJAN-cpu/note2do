import { render, screen, fireEvent } from '@testing-library/react';
import DocumentTypeSelector from './DocumentTypeSelector';

describe('DocumentTypeSelector', () => {
  const mockOnTypeSelect = jest.fn();
  const mockOnCancel = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render document type options', () => {
    render(
      <DocumentTypeSelector
        onTypeSelect={mockOnTypeSelect}
        onCancel={mockOnCancel}
      />
    );

    expect(screen.getByText('Choose Document Type')).toBeInTheDocument();
    expect(screen.getByText('Normal')).toBeInTheDocument();
    expect(screen.getByText('To-Do')).toBeInTheDocument();
    expect(screen.getByText('Free-form text notes')).toBeInTheDocument();
    expect(screen.getByText('Task list with checks')).toBeInTheDocument();
  });

  it('should call onTypeSelect with "normal" when Normal is clicked', () => {
    render(
      <DocumentTypeSelector
        onTypeSelect={mockOnTypeSelect}
        onCancel={mockOnCancel}
      />
    );

    const normalButton = screen.getByLabelText('Create Normal Document');
    fireEvent.click(normalButton);

    expect(mockOnTypeSelect).toHaveBeenCalledWith('normal');
  });

  it('should call onTypeSelect with "todo" when To-Do is clicked', () => {
    render(
      <DocumentTypeSelector
        onTypeSelect={mockOnTypeSelect}
        onCancel={mockOnCancel}
      />
    );

    const todoButton = screen.getByLabelText('Create To-Do Document');
    fireEvent.click(todoButton);

    expect(mockOnTypeSelect).toHaveBeenCalledWith('todo');
  });

  it('should call onCancel when Cancel button is clicked', () => {
    render(
      <DocumentTypeSelector
        onTypeSelect={mockOnTypeSelect}
        onCancel={mockOnCancel}
      />
    );

    const cancelButton = screen.getByText('Cancel');
    fireEvent.click(cancelButton);

    expect(mockOnCancel).toHaveBeenCalled();
  });

  it('should call onCancel when overlay is clicked', () => {
    render(
      <DocumentTypeSelector
        onTypeSelect={mockOnTypeSelect}
        onCancel={mockOnCancel}
      />
    );

    const overlay = screen.getByText('Choose Document Type').closest('.document-type-selector-overlay');
    if (overlay) {
      fireEvent.click(overlay);
      expect(mockOnCancel).toHaveBeenCalled();
    }
  });

  it('should call onCancel when Escape key is pressed', () => {
    render(
      <DocumentTypeSelector
        onTypeSelect={mockOnTypeSelect}
        onCancel={mockOnCancel}
      />
    );

    fireEvent.keyDown(document, { key: 'Escape' });

    expect(mockOnCancel).toHaveBeenCalled();
  });

  it('should have accessible aria labels', () => {
    render(
      <DocumentTypeSelector
        onTypeSelect={mockOnTypeSelect}
        onCancel={mockOnCancel}
      />
    );

    expect(screen.getByLabelText('Create Normal Document')).toBeInTheDocument();
    expect(screen.getByLabelText('Create To-Do Document')).toBeInTheDocument();
  });
});
