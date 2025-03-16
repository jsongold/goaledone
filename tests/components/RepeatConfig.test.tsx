import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { RepeatConfigInput } from '../../src/components/RepeatConfig';

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

  // ... rest of tests remain the same
}); 