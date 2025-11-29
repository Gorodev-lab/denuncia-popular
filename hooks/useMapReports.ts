import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../services/supabase';

/**
 * Interface for a report marker on the map
 */
export interface MapReport {
    id: number;
    lat: number;
    lng: number;
    address?: string;
    category?: string;
    description: string;
    created_at: string;
    folio: string;
}

/**
 * Custom hook to manage map reports data
 * Handles fetching from Supabase and state management
 * 
 * @returns {Object} - Reports data and loading/error states
 */
export const useMapReports = () => {
    const [reports, setReports] = useState<MapReport[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    /**
     * Fetch reports from Supabase
     * Memoized to prevent unnecessary re-renders
     */
    const fetchReports = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);

            const { data, error: fetchError } = await supabase
                .from('denuncias')
                .select('id, lat, lng, address, category, description, created_at, folio')
                .not('lat', 'is', null)
                .not('lng', 'is', null)
                .order('created_at', { ascending: false });

            if (fetchError) throw fetchError;

            setReports(data || []);
        } catch (err) {
            console.error('Error fetching reports:', err);
            setError(err instanceof Error ? err.message : 'Unknown error occurred');
        } finally {
            setLoading(false);
        }
    }, []);

    /**
     * Initial fetch on mount
     */
    useEffect(() => {
        fetchReports();
    }, [fetchReports]);

    /**
     * Subscribe to real-time changes
     */
    useEffect(() => {
        const channel = supabase
            .channel('denuncias-changes')
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'denuncias'
                },
                (payload) => {
                    console.log('Change received:', payload);
                    // Refetch on any change
                    fetchReports();
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [fetchReports]);

    return {
        reports,
        loading,
        error,
        refetch: fetchReports
    };
};
