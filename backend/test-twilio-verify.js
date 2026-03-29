import twilio from 'twilio';

const accountSid = 'AC536b5e61319836cdc31d61e65429a413';
const authToken = 'c1ee870cf901525e22abb01a13fe9cf4';
const verifyServiceSid = 'VAfd2a342b3fae3e86df281d028da708ed';

const client = twilio(accountSid, authToken);

async function testVerification() {
  try {
    console.log('Testing Twilio Verify Service...\n');
    
    const verification = await client.verify.v2.services(verifyServiceSid)
      .verifications
      .create({ to: '+919930404511', channel: 'sms' });
    
    console.log('✅ Verification created successfully!');
    console.log('   Verification SID:', verification.sid);
    console.log('   Status:', verification.status);
    console.log('   Channel:', verification.channel);
    
  } catch (error) {
    console.error('❌ Verification failed:', error.message);
    console.error('   Code:', error.code);
  }
}

testVerification();
