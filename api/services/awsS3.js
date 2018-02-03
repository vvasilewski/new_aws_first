var AWS = require('aws-sdk');
//var simpledb = require('simpledb');

module.exports = {
    getService: function (options, cb) {
        var conf = sails.config;

        if (!conf.awsS3) {
            conf.awsS3 = this.setService();
        }

        return conf.awsS3;
    },
    setService: function () {
        var conf = sails.config;

        var aw = aws.setService();
        conf.awsS3 = new aw.S3();

        console.log('set S3 service');
        return conf.awsS3;
    }
};