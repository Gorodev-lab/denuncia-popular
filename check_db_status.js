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
        console.log('='.repeat(60));
        console.log('VERIFICACIÓN DEL ESTADO DE LA BASE DE DATOS');
        console.log('='.repeat(60));
        console.log('\n1️⃣ Intentando contar registros totales...\n');

        // Intentar contar todos los registros
        const { count, error: countError } = await supabase
            .from('denuncias')
            .select('*', { count: 'exact', head: true });

        if (countError) {
            console.log('❌ Error al contar:', countError.message);
        } else {
            console.log(`📊 Total de registros en la tabla: ${count}`);
        }

        console.log('\n2️⃣ Verificando estructura de la tabla...\n');

        // Primero, intentar obtener todos los campos sin filtrar
        const { data: allData, error: allError } = await supabase
            .from('denuncias')
            .select('*')
            .limit(1);

        if (allError) {
            console.log('❌ Error al consultar estructura:', allError.message);
        } else if (allData && allData.length > 0) {
            console.log('✅ Estructura de la tabla (columnas disponibles):');
            console.log('   ' + Object.keys(allData[0]).join(', '));
        } else {
            console.log('ℹ️  No hay datos, pero intentaré describir la tabla...');
        }

        console.log('\n3️⃣ Intentando obtener CUALQUIER registro...\n');

        // Intentar obtener registros sin especificar columnas
        const { data, error } = await supabase
            .from('denuncias')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(10);

        if (error) {
            console.log('❌ Error al consultar:', error.message);
        } else if (data && data.length > 0) {
            console.log(`✅ Se encontraron ${data.length} registros:\n`);
            console.log('='.repeat(60));
            data.forEach((registro, index) => {
                console.log(`\n📌 Registro #${index + 1}`);
                console.log(JSON.stringify(registro, null, 2));
                console.log('   ' + '-'.repeat(56));
            });
            console.log('\n' + '='.repeat(60));
        } else {
            console.log('⚠️  La tabla está VACÍA (0 registros)');
            console.log('\n💡 Esto significa:');
            console.log('   ✓ La tabla existe y es accesible');
            console.log('   ✓ Las políticas RLS permiten lectura');
            console.log('   ✗ Nunca se ha creado ninguna denuncia');
            console.log('\n📝 Acción sugerida:');
            console.log('   → Crear una denuncia de prueba desde la aplicación');
            console.log('   → Verificar que el formulario esté funcionando correctamente');
        }

        console.log('\n' + '='.repeat(60));
        console.log('FIN DE LA VERIFICACIÓN');
        console.log('='.repeat(60));

    } catch (err) {
        console.error('💥 Error general:', err.message);
        console.error(err);
    }
})();
