
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function verifyStorage() {
    console.log('--- Verifying Supabase Storage ---');
    console.log('Project URL:', supabaseUrl);

    // 1. Check anonymous sign-in
    const { data: authData, error: authError } = await supabase.auth.signInAnonymously();
    if (authError) {
        console.error('❌ Anonymous sign-in failed:', authError.message);
    } else {
        console.log('✅ Anonymous sign-in successful. User ID:', authData.user?.id);
    }

    // 2. List buckets
    const { data: buckets, error: listError } = await supabase.storage.listBuckets();
    if (listError) {
        console.error('❌ Error listing buckets:', listError.message);
    } else {
        console.log('✅ Buckets found:', buckets.map(b => b.name).join(', '));
        const evidenceBucket = buckets.find(b => b.name === 'evidence');
        if (evidenceBucket) {
            console.log('✅ Bucket "evidence" exists and is public:', evidenceBucket.public);
        } else {
            console.error('❌ Bucket "evidence" DOES NOT EXIST.');
        }
    }
}

verifyStorage();
