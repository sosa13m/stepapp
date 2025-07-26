// js/supabase-config.js
const SUPABASE_URL = 'https://yswiovzterqvozyolhgb.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inlzd2lvdnp0ZXJxdm96eW9saGdiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMxNjQ0MzMsImV4cCI6MjA2ODc0MDQzM30.8sNIErpEBVRy0DkWIEa1e_oqKx_FrDmlIgSc4VJs29I';

const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

window.supabase = supabaseClient;

