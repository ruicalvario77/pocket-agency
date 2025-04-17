"use client"; // Ensure this is a client component to avoid SSR issues

import { useState } from 'react';

export default function HomePage() {
  const [errorTriggered, setErrorTriggered] = useState(false);

  const triggerError = () => {
    setErrorTriggered(true);
    throw new Error('Another test error for Sentry');
  };

  return (
    <div>
      <h1>Welcome to Pocket Agency</h1>
      <p>Unlimited Design & Development for Your Business</p>
      <button onClick={triggerError}>Trigger Sentry Error</button>
    </div>
  );
}