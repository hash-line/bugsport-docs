'use client';

import { ThumbsDown, ThumbsUp } from 'lucide-react';
import { useState } from 'react';

export function PageFeedback() {
  const [choice, setChoice] = useState<'yes' | 'no' | undefined>();
  const [submitted, setSubmitted] = useState(false);
  const [message, setMessage] = useState('');

  if (submitted) {
    return (
      <p className="mt-10 text-sm text-fd-muted-foreground" role="status">
        Thanks for the feedback.
      </p>
    );
  }

  return (
    <div className="mt-10 border-t pt-6">
      <p className="font-medium">Was this page helpful?</p>
      <div className="mt-3 flex gap-2">
        <button
          type="button"
          className={`inline-flex items-center gap-2 rounded-lg border px-3 py-1.5 text-sm ${choice === 'yes' ? 'border-fd-primary bg-fd-accent' : ''}`}
          onClick={() => setChoice('yes')}
        >
          <ThumbsUp className="size-4" aria-hidden="true" />
          Yes
        </button>
        <button
          type="button"
          className={`inline-flex items-center gap-2 rounded-lg border px-3 py-1.5 text-sm ${choice === 'no' ? 'border-fd-primary bg-fd-accent' : ''}`}
          onClick={() => {
            setChoice('no');
            setSubmitted(true);
          }}
        >
          <ThumbsDown className="size-4" aria-hidden="true" />
          No
        </button>
      </div>
      {choice === 'yes' ? (
        <form
          className="mt-4 flex flex-col gap-3"
          onSubmit={(event) => {
            event.preventDefault();
            setSubmitted(true);
          }}
        >
          <label className="text-sm text-fd-muted-foreground" htmlFor="page-feedback">
            Submit feedback
          </label>
          <textarea
            id="page-feedback"
            className="min-h-24 rounded-lg border bg-fd-background px-3 py-2 text-sm"
            value={message}
            onChange={(event) => setMessage(event.target.value)}
          />
          <button type="submit" className="self-start rounded-lg bg-fd-primary px-3 py-1.5 text-sm font-medium text-fd-primary-foreground">
            Submit feedback
          </button>
        </form>
      ) : null}
    </div>
  );
}
