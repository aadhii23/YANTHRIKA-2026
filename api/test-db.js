// Test endpoint to check Supabase connection and insert
import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
  try {
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      return res.status(500).json({ 
        error: 'Missing environment variables',
        supabaseUrl: !!supabaseUrl,
        supabaseKey: !!supabaseKey
      });
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Test 1: Check if we can connect
    const { data: testData, error: testError } = await supabase
      .from('event_registrations')
      .select('count')
      .limit(1);

    if (testError) {
      return res.status(500).json({
        step: 'connection_test',
        error: testError.message,
        code: testError.code,
        details: testError.details,
        hint: testError.hint
      });
    }

    // Test 2: Try a test insert
    const testInsert = {
      event_name: 'TEST EVENT',
      college_name: 'TEST COLLEGE',
      team_name: 'TEST TEAM',
      leader_name: 'Test User',
      leader_email: 'test@example.com',
      leader_phone: '1234567890',
      event_id: 'TEST-0000'
    };

    const { data: insertData, error: insertError } = await supabase
      .from('event_registrations')
      .insert([testInsert])
      .select();

    if (insertError) {
      return res.status(500).json({
        step: 'insert_test',
        error: insertError.message,
        code: insertError.code,
        details: insertError.details,
        hint: insertError.hint,
        testData: testInsert
      });
    }

    // Clean up - delete the test record
    if (insertData && insertData[0]) {
      await supabase
        .from('event_registrations')
        .delete()
        .eq('id', insertData[0].id);
    }

    return res.status(200).json({
      success: true,
      message: 'Database connection and insert test successful',
      insertedId: insertData[0]?.id
    });

  } catch (error) {
    return res.status(500).json({
      step: 'exception',
      error: error.message,
      stack: error.stack
    });
  }
}
