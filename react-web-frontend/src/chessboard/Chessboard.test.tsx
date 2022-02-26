import React from 'react';
import { render, screen } from '@testing-library/react';
import Chessboard from './Chessboard';

test('renders chessboard', () => {
  const { container } = render(<Chessboard />);
  const whites_king_square = container.querySelector('[data-square=e1]');
  expect(whites_king_square).toBeInTheDocument();
});