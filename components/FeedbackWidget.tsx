import React, { useState } from 'react';
import { MessageSquare, X, Send, Loader2 } from 'lucide-react';
import { supabase } from '../services/supabase';

export const FeedbackWidget: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [feedback, setFeedback] = useState('');
    const [type, setType] = useState<'bug' | 'suggestion' | 'other'>('suggestion');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!feedback.trim()) return;

        setIsSubmitting(true);

        try {
            const { error } = await supabase
                .from('feedback')
                .insert([
                    {
                        message: feedback,
                        type,
                        url: window.location.href,
                        user_agent: navigator.userAgent,
                        timestamp: new Date().toISOString()
                    }
                ]);

            if (error) throw error;

            setSubmitted(true);
            setTimeout(() => {
                setSubmitted(false);
                setFeedback('');
                setIsOpen(false);
            }, 2000);
        } catch (error) {
            console.error('Error submitting feedback:', error);
            alert('Error sending feedback. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed bottom-4 left-4 z-50">
            {!isOpen && (
                <button
                    onClick={() => setIsOpen(true)}
                    className="bg-violet-600 hover:bg-violet-700 text-white p-3 rounded-full shadow-lg transition-all duration-300 hover:scale-110 flex items-center gap-2"
                    title="Send Feedback"
                >
                    <MessageSquare size={24} />
                    <span className="max-w-0 overflow-hidden group-hover:max-w-xs transition-all duration-500 ease-in-out">
                        Feedback
                    </span>
                </button>
            )}

            {isOpen && (
                <div className="bg-slate-900 border border-slate-700 rounded-lg shadow-2xl p-4 w-80 animate-in slide-in-from-bottom-5 fade-in duration-200">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-white font-semibold">Focus Group Feedback</h3>
                        <button
                            onClick={() => setIsOpen(false)}
                            className="text-slate-400 hover:text-white transition-colors"
                        >
                            <X size={20} />
                        </button>
                    </div>

                    {submitted ? (
                        <div className="text-center py-8 text-green-400">
                            <p className="font-medium">Thank you for your feedback!</p>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm text-slate-400 mb-1">Type</label>
                                <div className="flex gap-2">
                                    {['bug', 'suggestion', 'other'].map((t) => (
                                        <button
                                            key={t}
                                            type="button"
                                            onClick={() => setType(t as any)}
                                            className={`px-3 py-1 rounded-full text-xs capitalize transition-colors ${type === t
                                                ? 'bg-violet-600 text-white'
                                                : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                                                }`}
                                        >
                                            {t}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm text-slate-400 mb-1">Message</label>
                                <textarea
                                    value={feedback}
                                    onChange={(e) => setFeedback(e.target.value)}
                                    placeholder="Tell us what you think or report a bug..."
                                    className="w-full bg-slate-800 border border-slate-700 rounded-md p-2 text-white text-sm focus:ring-2 focus:ring-violet-500 focus:outline-none resize-none h-24"
                                    required
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="w-full bg-violet-600 hover:bg-violet-700 text-white py-2 rounded-md text-sm font-medium transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isSubmitting ? (
                                    <>
                                        <Loader2 size={16} className="animate-spin" />
                                        Sending...
                                    </>
                                ) : (
                                    <>
                                        <Send size={16} />
                                        Send Feedback
                                    </>
                                )}
                            </button>
                        </form>
                    )}
                </div>
            )}
        </div>
    );
};
