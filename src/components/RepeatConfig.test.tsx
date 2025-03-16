import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { RepeatConfigInput } from './RepeatConfig';

describe('RepeatConfigInput', () => {
  const mockOnChange = jest.fn();

  beforeEach(() => {
    mockOnChange.mockClear();
  });

  test('renders with repeat checkbox unchecked by default', () => {
    render(<RepeatConfigInput value={undefined} onChange={mockOnChange} />);
    
    const checkbox = screen.getByLabelText('Repeat');
    expect(checkbox).not.toBeChecked();
  });

  test('renders with repeat checkbox checked when enabled value is provided', () => {
    render(
      <RepeatConfigInput 
        value={{ enabled: true, weekdays: ['mon', 'wed', 'fri'] }} 
        onChange={mockOnChange} 
      />
    );
    
    const checkbox = screen.getByLabelText('Repeat');
    expect(checkbox).toBeChecked();
  });

  test('opens dialog when checkbox is checked', async () => {
    render(<RepeatConfigInput value={undefined} onChange={mockOnChange} />);
    
    const checkbox = screen.getByLabelText('Repeat');
    await userEvent.click(checkbox);
    
    expect(screen.getByText('Repeat Configuration')).toBeInTheDocument();
  });

  test('opens dialog when label is clicked', async () => {
    render(<RepeatConfigInput value={undefined} onChange={mockOnChange} />);
    
    const label = screen.getByText('Repeat');
    await userEvent.click(label);
    
    expect(screen.getByText('Repeat Configuration')).toBeInTheDocument();
  });

  test('calls onChange with undefined when checkbox is unchecked', async () => {
    render(
      <RepeatConfigInput 
        value={{ enabled: true }} 
        onChange={mockOnChange} 
      />
    );
    
    const checkbox = screen.getByLabelText('Repeat');
    await userEvent.click(checkbox);
    
    expect(mockOnChange).toHaveBeenCalledWith(undefined);
  });

  test('toggles weekdays when clicked', async () => {
    render(<RepeatConfigInput value={undefined} onChange={mockOnChange} />);
    
    const label = screen.getByText('Repeat');
    await userEvent.click(label);
    
    const mondayButton = screen.getByText('Monday');
    await userEvent.click(mondayButton);
    
    expect(mondayButton).toHaveClass('bg-purple-100');
    
    // Click save
    const saveButton = screen.getByText('Save');
    await userEvent.click(saveButton);
    
    expect(mockOnChange).toHaveBeenCalledWith(
      expect.objectContaining({
        enabled: true,
        weekdays: ['mon']
      })
    );
  });

  test('applies weekday presets correctly', async () => {
    render(<RepeatConfigInput value={undefined} onChange={mockOnChange} />);
    
    const label = screen.getByText('Repeat');
    await userEvent.click(label);
    
    // Click weekdays preset
    const weekdaysButton = screen.getByText('Weekdays');
    await userEvent.click(weekdaysButton);
    
    // Click save
    const saveButton = screen.getByText('Save');
    await userEvent.click(saveButton);
    
    expect(mockOnChange).toHaveBeenCalledWith(
      expect.objectContaining({
        enabled: true,
        weekdays: ['mon', 'tue', 'wed', 'thu', 'fri']
      })
    );
  });

  test('removes preset days when clicked again', async () => {
    render(
      <RepeatConfigInput 
        value={{ enabled: true, weekdays: ['mon', 'tue', 'wed', 'thu', 'fri'] }} 
        onChange={mockOnChange} 
      />
    );
    
    const label = screen.getByText('Repeat');
    await userEvent.click(label);
    
    // Click weekdays preset (should remove all weekdays)
    const weekdaysButton = screen.getByText('Weekdays');
    await userEvent.click(weekdaysButton);
    
    // Click save
    const saveButton = screen.getByText('Save');
    await userEvent.click(saveButton);
    
    expect(mockOnChange).toHaveBeenCalledWith(
      expect.objectContaining({
        enabled: true,
        weekdays: undefined
      })
    );
  });

  test('configures relative days correctly', async () => {
    render(<RepeatConfigInput value={undefined} onChange={mockOnChange} />);
    
    const label = screen.getByText('Repeat');
    await userEvent.click(label);
    
    // Set relative days
    const daysInput = screen.getByPlaceholderText('n');
    await userEvent.type(daysInput, '7');
    
    // Change type to before_end
    const typeSelect = screen.getByDisplayValue('After beginning');
    await userEvent.selectOptions(typeSelect, 'Before end');
    
    // Click save
    const saveButton = screen.getByText('Save');
    await userEvent.click(saveButton);
    
    expect(mockOnChange).toHaveBeenCalledWith(
      expect.objectContaining({
        enabled: true,
        relativeDay: {
          days: 7,
          type: 'before_end'
        }
      })
    );
  });

  test('validates numeric input for relative days', async () => {
    render(<RepeatConfigInput value={undefined} onChange={mockOnChange} />);
    
    const label = screen.getByText('Repeat');
    await userEvent.click(label);
    
    // Set invalid relative days
    const daysInput = screen.getByPlaceholderText('n');
    await userEvent.type(daysInput, '-1');
    
    // Click save
    const saveButton = screen.getByText('Save');
    await userEvent.click(saveButton);
    
    // onChange should not be called with invalid input
    expect(mockOnChange).not.toHaveBeenCalled();
  });

  test('closes dialog when cancel is clicked', async () => {
    render(<RepeatConfigInput value={undefined} onChange={mockOnChange} />);
    
    const label = screen.getByText('Repeat');
    await userEvent.click(label);
    
    const cancelButton = screen.getByText('Cancel');
    await userEvent.click(cancelButton);
    
    expect(screen.queryByText('Repeat Configuration')).not.toBeInTheDocument();
    expect(mockOnChange).not.toHaveBeenCalled();
  });
}); 