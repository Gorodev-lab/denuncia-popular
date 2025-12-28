import { useState, useCallback } from 'react';
import { Step } from '../types';

export const useWizardNavigation = (initialStep: Step = Step.HOME) => {
    const [currentStep, setCurrentStep] = useState<Step>(initialStep);

    const goToStep = useCallback((step: Step) => {
        setCurrentStep(step);
    }, []);

    const nextStep = useCallback(() => {
        setCurrentStep(prev => prev + 1);
    }, []);

    const prevStep = useCallback(() => {
        setCurrentStep(prev => Math.max(Step.HOME, prev - 1));
    }, []);

    return {
        currentStep,
        goToStep,
        nextStep,
        prevStep
    };
};
