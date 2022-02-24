import React from 'react';
import { render, screen } from '@testing-library/react';
import App from './App';

test('renders learn react link', () => {
  const { container } = render(<App />);
  const whites_king_square = container.querySelector('[data-square=e1]');
  expect(whites_king_square).toBeInTheDocument();
});
