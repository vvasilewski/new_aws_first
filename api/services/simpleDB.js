var simpledb = require('simpledb');
var domain;
module.exports = {
    getService: function (options) {

        var conf = sails.config;
        if (!conf.simpleDB) {
            domain = options;
//            conf.simpleDB = new simpleDB();
            conf.simpleDB = this.setService(options);
        }

        return conf.simpleDB;
    },
    setService: function (domain) {
        var conf = sails.config;

        conf.simpleDB = new simpledb.SimpleDB({
            keyid: conf.myconf.key,
            secret: conf.myconf.secret
        });

        this.searchForDomain(conf.simpleDB, domain);

        return conf.simpleDB;
    },
    searchForDomain: function (sdb, domainName) {
        // search for domain name from config

//        sdb.deleteDomain(domainName, function (err) {
//            if (!err) {
//                console.log('God made the world, but we made the field.');
//            }
//        });
        var el = this;
        sdb.listDomains(function (err, result, meta) {
            if (err) {
                console.log('listDomains failed: ' + err.Message);
            } else {
                console.log('listDomains ok');
                var founded = false,
                        foundedHistory = false;
                for (var i = 0; i < result.length; i++) {
                    if (result[i] === domainName) {
                        founded = true;
                    }
                }

                if (!founded) {
                    if (!founded)
                        el.createDomainIfNotExist(sdb, domainName);
                }
            }
        });
    },
    createDomainIfNotExist: function (sdb, domainName) {
        sdb.createDomain(domainName, function (error) {
            console.log('Domain successfuly created');
        });
        return;
    },
    deleteDomain: function (sdb, domainName) {
        sdb.deleteDomain(domainName, function (err, res, meta) {
            if (!err) {
                console.log('God made the world, but we made the field.');
            }
        });
    },
    getItem: function (item) {

        return item;
    },
    saveItem: function (id, data) {

        this.getService().saveItem(domain, id, data, function (err, res, meta) {
            console.log('log created');
            if (err) {
                console.log('Ups log not created: ' + err.Message);
            }
            return true;
        });
    }
};
