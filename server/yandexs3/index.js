const { S3 } = require("@aws-sdk/client-s3");
const { Upload } = require("@aws-sdk/lib-storage");
const { NodeHttpHandler } = require("@aws-sdk/node-http-handler");
const https = require("https");
const conf = require("../config");

const s3Client = new S3({
	// https://docs.aws.amazon.com/sdk-for-javascript/v3/developer-guide/node-configuring-maxsockets.html
	requestHandler: new NodeHttpHandler({
		requestTimeout : 1000,
		// connectionTimeout: 1,
		// socketTimeout : 1000,
		httpsAgent: new https.Agent({
		  keepAlive: false,
		  maxSockets: 150,
		}),
	}),
	region : conf.yandexS3.region,
	endpoint : conf.yandexS3.endpoint,
	credentials : {
		accessKeyId : conf.yandexS3.accessKeyId,
		secretAccessKey : conf.yandexS3.secretAccessKey
	}
});

const upload = ({filename, buffer}, cb) => {
    // const uploads = [];
    new Upload({
        client: s3Client,
        params: {
            Bucket: conf.yandexS3.bucketName,
            Key: filename,Body: buffer
        }
    })
    .done()
    .catch((error) => { 
        console.log(error);
        cb(error); 
    })
    .then((value) => {
        console.log(value);
        cb(null, value); 
    });
}

const get = (url) => {
    return s3Client.getObject({
        Bucket : conf.yandexS3.bucketName,
        Key : url.split("?")[0] // replace query params
    })
}

module.exports = {
    upload,
    get
}