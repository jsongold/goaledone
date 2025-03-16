import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { RRuleConfig } from '../../src/components/RRuleConfig'; // Updated import path

describe('RRuleConfig', () => {
  const mockOnChange = jest.fn();
  
  beforeEach(() => {
    mockOnChange.mockClear();
  });

  // ... test implementation remains the same
}); 