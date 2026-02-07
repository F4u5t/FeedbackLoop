'use client';

import React from 'react';
import { useFormState, useFormStatus } from 'react-dom';
import { RetroButton } from '@/components/ui/RetroButton';

export type InviteActionState = {
  status: 'idle' | 'success' | 'error';
  message?: string;
};

type InviteAcceptFormProps = {
  action: (prevState: InviteActionState, formData: FormData) => Promise<InviteActionState>;
};

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <RetroButton
      type="submit"
      className="w-full"
      loading={pending}
      disabled={pending}
    >
      ACCEPT INVITE
    </RetroButton>
  );
}

export default function InviteAcceptForm({ action }: InviteAcceptFormProps) {
  const [state, formAction] = useFormState(action, { status: 'idle' });

  return (
    <form action={formAction} className="space-y-4">
      {state.status === 'success' && (
        <div className="text-terminal-green text-xs">
          ✓ Magic link sent. Check your email to continue.
        </div>
      )}
      {state.status === 'error' && (
        <div className="text-terminal-red text-xs">
          ✗ {state.message || 'Failed to send magic link. Try again.'}
        </div>
      )}

      <SubmitButton />
    </form>
  );
}
