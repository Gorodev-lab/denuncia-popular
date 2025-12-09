
import { render, screen } from '@testing-library/react';
import { expect, test, vi } from 'vitest';
import { StepInfo } from './StepInfo';
import { DenunciaDraft } from '../../types';

const mockUpdateDraft = vi.fn();
const mockOnNext = vi.fn();
const mockOnBack = vi.fn();

const initialDraft: DenunciaDraft = {
  isAnonymous: false,
  fullName: 'John Doe',
  email: '',
  description: '',
  evidenceFiles: [],
  evidenceUrls: [],
  category: 'OTHER',
};

test('Next button is disabled for incomplete email format', () => {
  render(
    <StepInfo
      draft={{ ...initialDraft, email: 'user@domain' }} // This email is invalid but passes the old check
      updateDraft={mockUpdateDraft}
      onNext={mockOnNext}
      onBack={mockOnBack}
    />
  );

  const nextButton = screen.getByRole('button', { name: /Siguiente Paso/i });
  expect(nextButton).toBeDisabled();
});

test('Next button is enabled for a valid email', () => {
  render(
    <StepInfo
      draft={{ ...initialDraft, email: 'user@domain.com' }}
      updateDraft={mockUpdateDraft}
      onNext={mockOnNext}
      onBack={mockOnBack}
    />
  );

  const nextButton = screen.getByRole('button', { name: /Siguiente Paso/i });
  expect(nextButton).not.toBeDisabled();
});
