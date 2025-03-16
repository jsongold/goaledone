import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { RRuleConfig } from './RRuleConfig'; // Update with actual path

describe('RRuleConfig', () => {
  const mockOnChange = jest.fn();
  
  beforeEach(() => {
    mockOnChange.mockClear();
  });

  test('renders frequency options correctly', () => {
    render(<RRuleConfig value={undefined} onChange={mockOnChange} />);
    
    // Open frequency dropdown
    const frequencySelect = screen.getByLabelText(/frequency/i);
    
    // Check that common frequency options are available
    expect(screen.getByText(/daily/i)).toBeInTheDocument();
    expect(screen.getByText(/weekly/i)).toBeInTheDocument();
    expect(screen.getByText(/monthly/i)).toBeInTheDocument();
    expect(screen.getByText(/yearly/i)).toBeInTheDocument();
  });

  test('sets daily frequency correctly', async () => {
    render(<RRuleConfig value={undefined} onChange={mockOnChange} />);
    
    // Select daily frequency
    const frequencySelect = screen.getByLabelText(/frequency/i);
    await userEvent.selectOptions(frequencySelect, 'DAILY');
    
    // Set interval to 2 days
    const intervalInput = screen.getByLabelText(/interval/i);
    await userEvent.clear(intervalInput);
    await userEvent.type(intervalInput, '2');
    
    // Save the config
    const saveButton = screen.getByText(/save/i);
    await userEvent.click(saveButton);
    
    // Check that onChange was called with correct RRULE
    expect(mockOnChange).toHaveBeenCalledWith(
      expect.stringContaining('FREQ=DAILY;INTERVAL=2')
    );
  });

  test('sets weekly frequency with days correctly', async () => {
    render(<RRuleConfig value={undefined} onChange={mockOnChange} />);
    
    // Select weekly frequency
    const frequencySelect = screen.getByLabelText(/frequency/i);
    await userEvent.selectOptions(frequencySelect, 'WEEKLY');
    
    // Select Monday and Wednesday
    const mondayCheckbox = screen.getByLabelText(/monday/i);
    const wednesdayCheckbox = screen.getByLabelText(/wednesday/i);
    
    await userEvent.click(mondayCheckbox);
    await userEvent.click(wednesdayCheckbox);
    
    // Save the config
    const saveButton = screen.getByText(/save/i);
    await userEvent.click(saveButton);
    
    // Check that onChange was called with correct RRULE
    expect(mockOnChange).toHaveBeenCalledWith(
      expect.stringContaining('FREQ=WEEKLY;BYDAY=MO,WE')
    );
  });

  test('sets monthly frequency with day of month correctly', async () => {
    render(<RRuleConfig value={undefined} onChange={mockOnChange} />);
    
    // Select monthly frequency
    const frequencySelect = screen.getByLabelText(/frequency/i);
    await userEvent.selectOptions(frequencySelect, 'MONTHLY');
    
    // Select day 15 of the month
    const dayInput = screen.getByLabelText(/day of month/i);
    await userEvent.clear(dayInput);
    await userEvent.type(dayInput, '15');
    
    // Save the config
    const saveButton = screen.getByText(/save/i);
    await userEvent.click(saveButton);
    
    // Check that onChange was called with correct RRULE
    expect(mockOnChange).toHaveBeenCalledWith(
      expect.stringContaining('FREQ=MONTHLY;BYMONTHDAY=15')
    );
  });

  test('sets end date correctly', async () => {
    render(<RRuleConfig value={undefined} onChange={mockOnChange} />);
    
    // Select "until" end option
    const untilRadio = screen.getByLabelText(/until/i);
    await userEvent.click(untilRadio);
    
    // Set end date
    const dateInput = screen.getByLabelText(/end date/i);
    await userEvent.clear(dateInput);
    await userEvent.type(dateInput, '2023-12-31');
    
    // Save the config
    const saveButton = screen.getByText(/save/i);
    await userEvent.click(saveButton);
    
    // Check that onChange was called with correct RRULE
    expect(mockOnChange).toHaveBeenCalledWith(
      expect.stringContaining('UNTIL=20231231T000000Z')
    );
  });

  test('sets count correctly', async () => {
    render(<RRuleConfig value={undefined} onChange={mockOnChange} />);
    
    // Select "count" end option
    const countRadio = screen.getByLabelText(/count/i);
    await userEvent.click(countRadio);
    
    // Set count to 10
    const countInput = screen.getByLabelText(/occurrence count/i);
    await userEvent.clear(countInput);
    await userEvent.type(countInput, '10');
    
    // Save the config
    const saveButton = screen.getByText(/save/i);
    await userEvent.click(saveButton);
    
    // Check that onChange was called with correct RRULE
    expect(mockOnChange).toHaveBeenCalledWith(
      expect.stringContaining('COUNT=10')
    );
  });

  test('parses existing RRULE string correctly', () => {
    // Render with existing RRULE
    render(
      <RRuleConfig 
        value="FREQ=WEEKLY;INTERVAL=2;BYDAY=MO,WE,FR" 
        onChange={mockOnChange} 
      />
    );
    
    // Check that form is populated correctly
    const frequencySelect = screen.getByLabelText(/frequency/i);
    expect(frequencySelect).toHaveValue('WEEKLY');
    
    const intervalInput = screen.getByLabelText(/interval/i);
    expect(intervalInput).toHaveValue('2');
    
    const mondayCheckbox = screen.getByLabelText(/monday/i);
    const wednesdayCheckbox = screen.getByLabelText(/wednesday/i);
    const fridayCheckbox = screen.getByLabelText(/friday/i);
    
    expect(mondayCheckbox).toBeChecked();
    expect(wednesdayCheckbox).toBeChecked();
    expect(fridayCheckbox).toBeChecked();
  });
}); 