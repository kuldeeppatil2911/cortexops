import { render, screen } from '@testing-library/react';
import App from './App';

test('renders CortexOps navigation', () => {
  render(<App />);
  expect(screen.getByText('CORTEX')).toBeInTheDocument();
  expect(screen.getByText('Overview')).toBeInTheDocument();
});
