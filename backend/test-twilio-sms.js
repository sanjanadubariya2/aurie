import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { sendSMS } from './utils/sendSMS.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '.env') });

async function testTwilio() {
  try {
    console.log('\n🧪 Testing Twilio SMS Service...\n');
    
    // Check environment
    console.log('Environment Check:');
    console.log('  TWILIO_ACCOUNT_SID:', process.env.TWILIO_ACCOUNT_SID?.substring(0, 5) + '****');
    console.log('  TWILIO_AUTH_TOKEN:', process.env.TWILIO_AUTH_TOKEN?.substring(0, 5) + '****');
    console.log('  TWILIO_PHONE_NUMBER:', process.env.TWILIO_PHONE_NUMBER);
    console.log('');
    
    // Test SMS
    const result = await sendSMS('+917325080103', 'Test SMS from Aurie Candles');
    
    console.log('Result:', result);
    
    if (result.success && !result.demo) {
      console.log('\n✅ Twilio is WORKING!');
    } else if (result.demo) {
      console.log('\n⚠️  Running in DEMO MODE - Twilio credentials not found or invalid');
    } else {
      console.log('\n❌ Error:', result.error);
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
  process.exit(0);
}

testTwilio();
