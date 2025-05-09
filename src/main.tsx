import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { ErrorBoundary } from 'react-error-boundary'

function ErrorFallback({ error, resetErrorBoundary }: { error: Error; resetErrorBoundary: () => void }) {
  return (
    <div role="alert" className="p-4 m-4 border border-red-500 rounded-md bg-red-50">
      <h2 className="text-lg font-semibold text-red-700">Something went wrong:</h2>
      <pre className="mt-2 text-sm text-red-600">{error.message}</pre>
      <button
        onClick={resetErrorBoundary}
        className="mt-4 px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
      >
        Try again
      </button>
    </div>
  )
}

const rootElement = document.getElementById("root");
if (!rootElement) throw new Error('Failed to find the root element');

const root = createRoot(rootElement);

root.render(
  <ErrorBoundary
    FallbackComponent={ErrorFallback}
    onReset={() => {
      // Reset the state of your app here
      window.location.reload();
    }}
  >
    <App />
  </ErrorBoundary>
);
