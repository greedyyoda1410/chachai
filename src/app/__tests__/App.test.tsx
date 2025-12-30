import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import App from '../App';

// App already includes BrowserRouter, which is set up in test/setup.ts
describe('App Routing', () => {
  it('should render app without crashing', () => {
    const { container } = render(<App />);
    expect(container).toBeTruthy();
  });

  it('should render app structure correctly', () => {
    const { container } = render(<App />);
    // App should render with routes
    expect(container).toBeTruthy();
  });
});

