var AWS = require('aws-sdk');

module.exports = {
    setService: function () {

        AWS.config.update({
            accessKeyId: sails.config.myconf.key,
            secretAccessKey: sails.config.myconf.secret,
            region: 'us-east-1'
        });

        console.log('set AWS config');
        return AWS;
    }
};