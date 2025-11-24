import { render, screen, fireEvent } from '@testing-library/react';
import TodoItem from './TodoItem';
import { TodoItem as TodoItemType } from '@/lib/api';

describe('TodoItem', () => {
  const mockItem: TodoItemType = {
    id: '1',
    description: 'Test task',
    checked: false,
    order: 0
  };

  const mockOnUpdate = jest.fn();
  const mockOnDelete = jest.fn();
  const mockOnToggle = jest.fn();
  const mockOnEnterPress = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render todo item with description', () => {
    render(
      <TodoItem
        item={mockItem}
        onUpdate={mockOnUpdate}
        onDelete={mockOnDelete}
        onToggle={mockOnToggle}
        onEnterPress={mockOnEnterPress}
      />
    );

    expect(screen.getByText('Test task')).toBeInTheDocument();
  });

  it('should render unchecked checkbox for unchecked item', () => {
    render(
      <TodoItem
        item={mockItem}
        onUpdate={mockOnUpdate}
        onDelete={mockOnDelete}
        onToggle={mockOnToggle}
        onEnterPress={mockOnEnterPress}
      />
    );

    const checkbox = screen.getByRole('checkbox');
    expect(checkbox).not.toBeChecked();
  });

  it('should render checked checkbox for checked item', () => {
    const checkedItem = { ...mockItem, checked: true };
    render(
      <TodoItem
        item={checkedItem}
        onUpdate={mockOnUpdate}
        onDelete={mockOnDelete}
        onToggle={mockOnToggle}
        onEnterPress={mockOnEnterPress}
      />
    );

    const checkbox = screen.getByRole('checkbox');
    expect(checkbox).toBeChecked();
  });

  it('should call onToggle when checkbox is clicked', () => {
    render(
      <TodoItem
        item={mockItem}
        onUpdate={mockOnUpdate}
        onDelete={mockOnDelete}
        onToggle={mockOnToggle}
        onEnterPress={mockOnEnterPress}
      />
    );

    const checkbox = screen.getByRole('checkbox');
    fireEvent.click(checkbox);

    expect(mockOnToggle).toHaveBeenCalledWith('1');
  });

  it('should enter edit mode when description is clicked', () => {
    render(
      <TodoItem
        item={mockItem}
        onUpdate={mockOnUpdate}
        onDelete={mockOnDelete}
        onToggle={mockOnToggle}
        onEnterPress={mockOnEnterPress}
      />
    );

    const description = screen.getByText('Test task');
    fireEvent.click(description);

    // Should show input field
    expect(screen.getByDisplayValue('Test task')).toBeInTheDocument();
  });

  it('should call onUpdate when description is edited and blurred', () => {
    render(
      <TodoItem
        item={mockItem}
        onUpdate={mockOnUpdate}
        onDelete={mockOnDelete}
        onToggle={mockOnToggle}
        onEnterPress={mockOnEnterPress}
      />
    );

    const description = screen.getByText('Test task');
    fireEvent.click(description);

    const input = screen.getByDisplayValue('Test task') as HTMLInputElement;
    fireEvent.change(input, { target: { value: 'Updated task' } });
    fireEvent.blur(input);

    expect(mockOnUpdate).toHaveBeenCalledWith('1', 'Updated task');
  });

  it('should call onEnterPress when Enter is pressed in edit mode', () => {
    render(
      <TodoItem
        item={mockItem}
        onUpdate={mockOnUpdate}
        onDelete={mockOnDelete}
        onToggle={mockOnToggle}
        onEnterPress={mockOnEnterPress}
      />
    );

    const description = screen.getByText('Test task');
    fireEvent.click(description);

    const input = screen.getByDisplayValue('Test task');
    fireEvent.keyDown(input, { key: 'Enter' });

    expect(mockOnEnterPress).toHaveBeenCalledWith('1');
  });

  it('should call onDelete when delete button is clicked', () => {
    render(
      <TodoItem
        item={mockItem}
        onUpdate={mockOnUpdate}
        onDelete={mockOnDelete}
        onToggle={mockOnToggle}
        onEnterPress={mockOnEnterPress}
      />
    );

    const deleteButton = screen.getByLabelText('Delete to-do item');
    fireEvent.click(deleteButton);

    expect(mockOnDelete).toHaveBeenCalledWith('1');
  });

  it('should call onDelete when Backspace is pressed on empty item', () => {
    const emptyItem = { ...mockItem, description: '' };
    render(
      <TodoItem
        item={emptyItem}
        onUpdate={mockOnUpdate}
        onDelete={mockOnDelete}
        onToggle={mockOnToggle}
        onEnterPress={mockOnEnterPress}
      />
    );

    const description = screen.getByText('Empty item');
    fireEvent.click(description);

    const input = screen.getByDisplayValue('');
    fireEvent.keyDown(input, { key: 'Backspace' });

    expect(mockOnDelete).toHaveBeenCalledWith('1');
  });

  it('should apply checked styling to checked items', () => {
    const checkedItem = { ...mockItem, checked: true };
    render(
      <TodoItem
        item={checkedItem}
        onUpdate={mockOnUpdate}
        onDelete={mockOnDelete}
        onToggle={mockOnToggle}
        onEnterPress={mockOnEnterPress}
      />
    );

    const description = screen.getByText('Test task');
    expect(description).toHaveClass('checked');
  });

  it('should have proper accessibility attributes', () => {
    render(
      <TodoItem
        item={mockItem}
        onUpdate={mockOnUpdate}
        onDelete={mockOnDelete}
        onToggle={mockOnToggle}
        onEnterPress={mockOnEnterPress}
      />
    );

    const checkbox = screen.getByRole('checkbox');
    expect(checkbox).toHaveAttribute('aria-label');
  });

  it('should support Space key to toggle checkbox', () => {
    render(
      <TodoItem
        item={mockItem}
        onUpdate={mockOnUpdate}
        onDelete={mockOnDelete}
        onToggle={mockOnToggle}
        onEnterPress={mockOnEnterPress}
      />
    );

    const checkbox = screen.getByRole('checkbox');
    fireEvent.keyDown(checkbox, { key: ' ' });

    expect(mockOnToggle).toHaveBeenCalledWith('1');
  });
});
