import { useState, useCallback } from 'react';
import { DenunciaDraft } from '../types';

const INITIAL_DRAFT: DenunciaDraft = {
  isAnonymous: false,
  fullName: '',
  email: '',
  location: null,
  description: '',
  category: '',
  evidenceFiles: []
};

export const useDenunciaDraft = () => {
  const [draft, setDraft] = useState<DenunciaDraft>(INITIAL_DRAFT);

  const updateDraft = useCallback((updates: Partial<DenunciaDraft>) => {
    setDraft(prev => ({ ...prev, ...updates }));
  }, []);

  const resetDraft = useCallback(() => {
    setDraft(INITIAL_DRAFT);
  }, []);

  return {
    draft,
    updateDraft,
    resetDraft
  };
};
