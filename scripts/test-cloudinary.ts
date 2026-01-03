import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary
cloudinary.config({
    cloud_name: 'dlntpqloq',
    api_key: '495853311723632',
    api_secret: 'W7gcPwwVHwFn4SaGlhigSWwpBAM'
});

async function testCloudinary() {
    try {
        console.log('Testing Cloudinary connection...');

        // Test API by fetching account details
        const result = await cloudinary.api.ping();
        console.log('✅ Cloudinary API is working!');
        console.log('Response:', result);

        // Also get usage info
        const usage = await cloudinary.api.usage();
        console.log('\n📊 Account Usage:');
        console.log(`   Storage: ${Math.round(usage.storage.usage / 1024 / 1024)} MB used`);
        console.log(`   Bandwidth: ${Math.round(usage.bandwidth.usage / 1024 / 1024)} MB used`);

    } catch (error: any) {
        console.error('❌ Cloudinary API test failed:', error.message);
    }
}

testCloudinary();
