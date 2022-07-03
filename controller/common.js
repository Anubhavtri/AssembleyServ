const db = require('../config/db')
const fs = require('fs')
const S3 = require('aws-sdk/clients/s3')
const constant = require('../config/constant')
module.exports = {
    uploadBase64: async (req, callback) => {
        try {

            const bucket = new S3(
                {
                    accessKeyId: constant.s3Credentials.AccessKey,
                    secretAccessKey: constant.s3Credentials.SecretKey,
                    region: constant.s3Credentials.Region,
                }
            );
            const FILE_KEY = (Math.floor(Math.random() * 1000000000) + 1) + '_' + Math.round((new Date()).getTime() / 1000) + `.${req.body.file_type}`;
            var file_buffer = Buffer.from(req.body.data.replace(/^data:image\/\w+;base64,/, ""), 'base64');

            var S3Payload = {
                Bucket: constant.s3Credentials.Bucket,
                Key: FILE_KEY,
                Body: file_buffer,
                ContentEncoding: 'base64',
                // ContentType: `image/${req.body.file_type}`
            };
            bucket.upload(S3Payload, async (error, file) => {
                if (error) {
                    console.log('There was an error uploading your file to s3: ', error);
                    callback(400, error.message, error);
                } else {
                    // callback(200, "Successfull Upload", file)
                    callback(200, "File Uploaded",file.Location);
                }
            })
            // var base64Data = req.body.replace(/^data:image\/png;base64,/, "");

            // require("fs").writeFile("out.png", base64Data, 'base64', function (err) {
            //     console.log(err);
            // });
            
            // let upload = await fs.writeFileSync('feeds/' + req.body.file_name, req.body.data, 'base64');
            // callback(200, "File Uploaded", 'http://127.0.0.1:3000/feeds/' + req.body.file_name);
            // callback(200, "File Uploaded", 'https://doodle-care.herokuapp.com/feeds/' + req.body.file_name);
            
        } catch (error) {
            console.error(error);
            callback(500, error.message, error);
        }
    }
}