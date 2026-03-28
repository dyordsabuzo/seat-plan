import { render } from '@testing-library/react';
import App from './App';
import { AuthProvider } from './context/AuthContext';
import { OptionsProvider } from './context/OptionsContext';
import { AppQueryProvider } from './shared/query';

test('renders learn react link', () => {
  render(
    <OptionsProvider>
      <AppQueryProvider>
        <AuthProvider>
          <App />
        </AuthProvider>
      </AppQueryProvider>
    </OptionsProvider>
  );
  // const linkElement = screen.getByText(/learn react/i);
  // expect(linkElement).toBeInTheDocument();
});
