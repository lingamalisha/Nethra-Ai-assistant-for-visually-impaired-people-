import React from 'react';

interface AudioAnnouncerProps {
  assertiveMessage?: string | null;
  politeMessage?: string | null;
}

export const AudioAnnouncer: React.FC<AudioAnnouncerProps> = ({
  assertiveMessage,
  politeMessage,
}) => {
  return (
    <>
      {/* Assertive live region for critical alerts, voice command confirmations, and currency results */}
      <div
        role="status"
        aria-live="assertive"
        aria-atomic="true"
        className="sr-only"
        data-testid="assertive-announcer"
      >
        {assertiveMessage}
      </div>

      {/* Polite live region for background status, camera status, and network connectivity updates */}
      <div
        role="status"
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
        data-testid="polite-announcer"
      >
        {politeMessage}
      </div>
    </>
  );
};
