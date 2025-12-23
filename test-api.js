import fetch from 'node-fetch';

async function testBackend() {
  try {
    console.log('Testing backend health endpoint...');
    const response = await fetch('http://localhost:5000/api/health');
    const data = await response.json();
    console.log('✅ Health check passed:', data);
    
    console.log('\nTesting signup endpoint...');
    const signupResponse = await fetch('http://localhost:5000/api/auth/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123'
      })
    });
    const signupData = await signupResponse.json();
    console.log('Signup response:', signupData);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testBackend();
