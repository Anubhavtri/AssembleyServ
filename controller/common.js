const db = require('../config/db')
const fs = require('fs')
module.exports = {
    uploadBase64: async (req, callback) => {
        try {
            // var base64Data = req.body.replace(/^data:image\/png;base64,/, "");

            // require("fs").writeFile("out.png", base64Data, 'base64', function (err) {
            //     console.log(err);
            // });
            
            let upload = await fs.writeFileSync('feeds/' + req.body.file_name, req.body.data, 'base64');
            // callback(200, "File Uploaded", 'http://127.0.0.1:3000/feeds/' + req.body.file_name);
            callback(200, "File Uploaded", 'https://doodle-care.herokuapp.com/feeds/' + req.body.file_name);
            // const newSchool = await db['school'](req.body)
            // newSchool.save()
            //     .then(async school => {
            //         callback(200, "School added", school)
            //     })
            //     .catch(error => {
            //         callback(500, error.message, error);
            //     })
        } catch (error) {
            console.error(error);
            callback(500, error.message, error);
        }
    }
}