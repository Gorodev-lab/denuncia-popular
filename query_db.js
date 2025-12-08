import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Error: Faltan variables de entorno VITE_SUPABASE_URL o VITE_SUPABASE_ANON_KEY');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

(async () => {
    try {
        console.log('Consultando los últimos registros en la base de datos...\n');

        const { data, error } = await supabase
            .from('denuncias')
            .select('folio, created_at, description, status, email')
            .order('created_at', { ascending: false })
            .limit(10);

        if (error) throw error;

        if (data && data.length > 0) {
            console.log(`✅ Se encontraron ${data.length} registros recientes:\n`);
            console.log('================================================');
            data.forEach((registro, index) => {
                console.log(`\n${index + 1}. Folio: ${registro.folio}`);
                console.log(`   Fecha: ${new Date(registro.created_at).toLocaleString('es-MX')}`);
                console.log(`   Email: ${registro.email || 'N/A'}`);
                console.log(`   Status: ${registro.status || 'N/A'}`);
                console.log(`   Descripción: ${registro.description?.substring(0, 100) || 'N/A'}...`);
                console.log('   ---');
            });
            console.log('\n================================================');
        } else {
            console.log('❌ No se encontraron registros en la base de datos');
        }
    } catch (err) {
        console.error('Error:', err.message);
    }
})();
