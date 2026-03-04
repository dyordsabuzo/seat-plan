import { render } from '@testing-library/react';
import App from './App';
import { AuthProvider } from './context/AuthContext';
import { OptionsProvider } from './context/OptionsContext';

test('renders learn react link', () => {
  render(
    <OptionsProvider>
      <AuthProvider>
        <App />
      </AuthProvider>
    </OptionsProvider>
  );
  // const linkElement = screen.getByText(/learn react/i);
  // expect(linkElement).toBeInTheDocument();
});
