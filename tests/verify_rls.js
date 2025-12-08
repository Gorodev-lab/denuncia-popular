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

async function verifyRLS() {
    console.log('🔒 Verificando Políticas de Seguridad (RLS)...\n');

    // 1. Test Anonymous SELECT (Should succeed)
    console.log('1️⃣  Prueba: Lectura Anónima (SELECT)');
    const { data: selectData, error: selectError } = await supabase
        .from('denuncias')
        .select('folio')
        .limit(1);

    if (selectError) {
        console.log('   ❌ Falló: ', selectError.message);
    } else {
        console.log('   ✅ Éxito: Se pueden leer denuncias públicamente.');
    }

    // 2. Test Anonymous INSERT (Should fail)
    console.log('\n2️⃣  Prueba: Escritura Anónima (INSERT)');
    const { error: insertError } = await supabase
        .from('denuncias')
        .insert([{
            folio: `test-${Date.now()}`,
            description: 'Intento de hackeo anónimo',
            status: 'PENDING'
        }]);

    if (insertError) {
        console.log('   ✅ Éxito (Bloqueado): ', insertError.message);
    } else {
        console.log('   ❌ Falló: Se permitió insertar sin autenticación (ESTO ES MALO).');
    }

    // 3. Test Authenticated INSERT (Mocking auth is hard without a real user, skipping for now or assuming success if policy is correct)
    // For this script, we are testing the "deny by default" for anon.

    console.log('\n------------------------------------------------');
    console.log('Resumen:');
    if (!selectError && insertError) {
        console.log('✅ Las políticas RLS parecen estar funcionando correctamente para usuarios anónimos.');
    } else {
        console.log('⚠️  Revisar políticas RLS.');
    }
}

verifyRLS();
