/**
 * FileListController
 *
 * @description :: Server-side logic for managing Filelists
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */

async = require("async");
var $ = require('jquery');
var http = require('http');

module.exports = {
    list: function (req, res) {

        /**
         * local variables for controller
         * @param s3 - variable to handle AWS.S3 object connection
         * @param bucketList - array of all buckets
         */
        var s3 = awsS3.getService();
        //console.log(s3);
        var bucketList = [];
        s3.listBuckets(function (err, data) {
            if (data) {
                for (var index in data.Buckets) {
                    var bucket = data.Buckets[index];
                    bucketList.push(bucket);
                }
            }
            res.view('filelist', {
                bucketList: bucketList
            });
        });
    },
    get: function (req, res) {
        /**
         *
         * @type @exp;awsS3@call;getService
         */
        var s3 = awsS3.getService();
        /**
         *
         * @array Array
         */
        var dataArray = [];
        var sdb = simpleDB.getService(sails.config.myconf.domainName);

        var queue = async.queue(function (task, callback) {

            sdb.getItem(sails.config.myconf.domainName, task.Key, function (error, result, meta) {
//                console.log(task);
                dataArray.push({
                    key: task.Key,
                    filename: result.filename,
                    type: result.type,
                    etag: task.ETag,
                    lastModified: task.LastModified,
                    bucket: req.param('id')
                });
                callback();
            });

        }, 1);

        queue.drain = function () {
            res.view('filelist2', {
                fileList: dataArray
            });
            console.log('all items have been processed');
        };


        s3.listObjects({
            Bucket: req.param('id'),
        }, function (err, data) {
            if (err) {
                console.log(err, err.stack);
            } else {
                if (!data.Contents.length > 0) {
                    queue.drain();
                }

                _.each(data.Contents, function (item) {
//                    console.log(item);
                    var objectName = item;
                    queue.push(objectName);
                });
            }

        });
    },
    rotate: function (req, res) {

        var params = {
            MessageBody: req.param('id'),
            QueueUrl: 'https://sqs.us-east-1.amazonaws.com/833679955307/IMAGE_ROTATE'
        };

        var aw = aws.setService();
        var sqs = new aw.SQS();
        sqs.sendMessage(params, function (err, data) {
            if (err) {
                console.log(err, err.stack);
                return res.send(false);
            } else {
                return res.send(true);
            }
        });
    },
    add: function (req, res) {
        var s3 = awsS3.getService();
        var sdb = simpleDB.getService(sails.config.myconf.domainName);

        var queue = async.queue(function (file, callback) {

            sdb.putItem(sails.config.myconf.domainName, file.fd, {
                filepath: file.fd,
                filename: file.filename,
                type: file.type,
                key: file.extra.key
            }, function (error) {
                console.log(error);
            });
            callback();
        }, 1);

        queue.drain = function () {
            console.log('all items have been uploaded');
        };

        if (req.method === 'POST') {
            req.file('fileupload').upload({
                adapter: require('skipper-s3'),
                key: sails.config.myconf.key,
                secret: sails.config.myconf.secret,
                bucket: 'wasilewskibucket',
                region: 'us-standard'
            }, function whenDone(err, uploadedFiles) {
                if (err) {
                    growl('Error uploading');
                    return res.negotiate(err);
                } else {
                    var file;

                    if (uploadedFiles) {
                        _.each(uploadedFiles, function (item) {
                            var objectName = item;
                            queue.push(objectName);
                        });
                    }
                    res.view('fileadd');
                }

            });
        } else {
            res.view('fileadd');
        }
    }
};

