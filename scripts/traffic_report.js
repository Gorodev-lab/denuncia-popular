
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Load env vars
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SERVICE_ROLE_KEY = process.argv[2];

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
    console.error('Error: Missing SUPABASE_URL or SERVICE_ROLE_KEY');
    console.log('Usage: node scripts/traffic_report.js <SERVICE_ROLE_KEY>');
    process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

async function getTrafficReport() {
    console.log('Generando reporte de tráfico...\n');

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayISO = today.toISOString();

    // 1. Total Denuncias
    const { count: totalDenuncias, error: errorTotal } = await supabase
        .from('denuncias')
        .select('*', { count: 'exact', head: true });

    if (errorTotal) console.error('Error fetching total denuncias:', errorTotal.message);

    // 2. Denuncias Today
    const { count: todayDenuncias, error: errorToday } = await supabase
        .from('denuncias')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', todayISO);

    if (errorToday) console.error('Error fetching today denuncias:', errorToday.message);

    // 3. Total Feedback
    const { count: totalFeedback, error: errorFeedback } = await supabase
        .from('feedback')
        .select('*', { count: 'exact', head: true });

    if (errorFeedback) console.error('Error fetching total feedback:', errorFeedback.message);

    // 4. Feedback Today
    const { count: todayFeedback, error: errorFeedbackToday } = await supabase
        .from('feedback')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', todayISO);

    if (errorFeedbackToday) console.error('Error fetching today feedback:', errorFeedbackToday.message);


    console.log('==========================================');
    console.log('       REPORTE DE TRÁFICO (DENUNCIA POPULAR)       ');
    console.log('==========================================');
    console.log(`Fecha: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}`);
    console.log('------------------------------------------');
    console.log(`📍 Denuncias Totales:      ${totalDenuncias ?? 0}`);
    console.log(`📅 Denuncias Hoy:          ${todayDenuncias ?? 0}`);
    console.log('------------------------------------------');
    console.log(`💬 Feedback Total:         ${totalFeedback ?? 0}`);
    console.log(`📅 Feedback Hoy:           ${todayFeedback ?? 0}`);
    console.log('==========================================');
}

getTrafficReport();
