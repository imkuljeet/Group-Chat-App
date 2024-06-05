const AWS = require('aws-sdk');

async function uploadToS3(data, filename) {
    const BUCKET_NAME = process.env.BUCKET_NAME;
    const IAM_USER_KEY = process.env.IAM_USER_KEY;
    const IAM_USER_SECRET = process.env.IAM_USER_SECRET;

    const s3bucket = new AWS.S3({
        accessKeyId: IAM_USER_KEY,
        secretAccessKey: IAM_USER_SECRET
    });

    const params = {
        Bucket: BUCKET_NAME,
        Key: filename,
        Body: data,
        ACL: 'public-read'
    };

    try {
        const s3response = await s3bucket.upload(params).promise();
        console.log('Upload successful:', s3response.Location);
        return s3response.Location;
    } catch (error) {
        console.error('Error uploading to S3:', error);
        throw error; // Propagate the error for handling at a higher level
    }
}

module.exports = {
    uploadToS3
} 