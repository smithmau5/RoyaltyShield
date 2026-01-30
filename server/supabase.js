const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

let supabase = null;

if (supabaseUrl && supabaseKey) {
    supabase = createClient(supabaseUrl, supabaseKey);
} else {
    console.warn('Supabase credentials missing. Persistence disabled.');
}

/**
 * Supabase Persistence Stub
 */
const saveAuditLog = async (auditData) => {
    if (!supabase) return null;

    try {
        const { data, error } = await supabase
            .from('audit_logs')
            .insert([auditData]);

        if (error) throw error;
        return data;
    } catch (error) {
        console.error('Supabase Error (Audit Log):', error.message);
        return null;
    }
};

const getTrackHistory = async (trackId) => {
    if (!supabase) return [];

    try {
        const { data, error } = await supabase
            .from('track_history')
            .select('*')
            .eq('track_id', trackId)
            .order('timestamp', { ascending: false });

        if (error) throw error;
        return data;
    } catch (error) {
        console.error('Supabase Error (Track History):', error.message);
        return [];
    }
};

module.exports = {
    supabase,
    saveAuditLog,
    getTrackHistory
};
