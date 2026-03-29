import admin from 'firebase-admin';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '.env') });

const serviceAccountJSON = process.env.FIREBASE_SERVICE_ACCOUNT;
if (!serviceAccountJSON) {
  console.error('❌ FIREBASE_SERVICE_ACCOUNT not set');
  process.exit(1);
}

try {
  const serviceAccount = JSON.parse(serviceAccountJSON);
  
  console.log('🔥 Initializing Firebase Admin...');
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    projectId: serviceAccount.project_id,
  });
  
  const db = admin.firestore();
  console.log('✅ Firebase Admin initialized');
  
  console.log('\n📊 Testing Firestore connectivity...');
  
  // Test write
  const testRef = db.collection('_test').doc('firestore_check_' + Date.now());
  await testRef.set({ test: true, timestamp: new Date() });
  console.log('✅ Write successful');
  
  // Test read
  const doc = await testRef.get();
  console.log('✅ Read successful:', doc.data());
  
  // Cleanup
  await testRef.delete();
  console.log('✅ Delete successful');
  
  console.log('\n🎉 Firestore is ACTIVE and working!');
  process.exit(0);
} catch (err) {
  console.error('❌ Firestore error:', err.message);
  console.error('Details:', err.code);
  process.exit(1);
}
