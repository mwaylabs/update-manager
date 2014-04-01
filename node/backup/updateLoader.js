#! /usr/bin/env node
 // Copyright (c) 2014 M-Way Solutions GmbH
// https://github.com/mwaylabs/brackets-quick-require/blob/master/LICENCE

(function() {
    "use strict";
    var fs = require('fs');
    var http = require('http');
    var url = require('url');
    var semver = require('semver');
    var AdmZip = require('adm-zip');
    var mkdirp = require('mkdirp');

    var request = require('request');


    /**
     * parses the given URL and passes to handler
     * @param {options} contains URL to the remote version-file
     */
    function update(options) {

        debugger;
        var _options = {
            host: url.parse(options.updateVersionURL).host,
            uri: url.parse(options.updateVersionURL),
            port: 8000,
            path: url.parse(options.updateVersionURL).pathname,
            globalExtensionDir: options.globalExtensionDir
        };

        //TODO remove manually set port
        _options.uri.port = 8000;

        _handleUpdateProcess(_options);
    }

    function _handleUpdateProcess(options) {
        var parsedVersionFile = null;
        if (options && options.host) {
            //get the remote version file
           request(options, function (error, res, body) {
               if(!error) {
                   try {
                       parsedVersionFile = JSON.parse(body);
                       decideGetNewFiles(parsedVersionFile, options);
                   } catch (err) {
                       console.log(err);
                   }
               } else {
                   console.log(options);
                   console.log(error);
                   console.log('unable to connect');
               }

            });
        }
    }

    function decideGetNewFiles(parsedVersionFile, options) {

        var localVersionFile = null;

        //Build global path to the extension folder
        var filePath = options.globalExtensionDir + '/' + parsedVersionFile.extractPath;

        try {
            localVersionFile = fs.readFileSync(filePath + 'version.json', 'utf8');
        } catch (e) {
            console.log(e);
            console.log('try to get the files from remote');
            // if there is no version.json locally, go and get it
            _getZipFile(parsedVersionFile, filePath);
            return;
        }


        try {
            localVersionFile = JSON.parse(localVersionFile);
        } catch (e) {
            console.log(e);
            _getZipFile(parsedVersionFile, filePath);
            console.log('try to get the files from remote');
            return;
        }


        _helperDecisionMaker(parsedVersionFile, localVersionFile, filePath);

    }

    function _helperDecisionMaker(parsedVersionFile, localVersionFile, filePath) {
        if (!parsedVersionFile || !localVersionFile) {
            return;
        }

        var remoteVersionNum = semver.valid(parsedVersionFile.version);
        var localVersionNum = semver.valid(localVersionFile.version);

        // if the local version number is invalid, get the new files
        if (!localVersionNum) {
            _getZipFile(parsedVersionFile, filePath);
            return;
        }

        // if the remote version number is invalid, do nothing
        if (!remoteVersionNum) {
            return;
        }

        //compare version numbers
        if (semver.lt(localVersionNum, remoteVersionNum)) {
            //update files
            _getZipFile(parsedVersionFile, filePath);

        } else {
            //everything is up-to-date, do nothing
        }
    }

    function _getZipFile(parsedVersionFile, filePath) {
        var _options = {
            uri: url.parse(parsedVersionFile.updateURL),
            port: parsedVersionFile.port,
            path: url.parse(parsedVersionFile.updateURL).pathname
        };



        /**
         * build backup
         */
        var oldFiles = new AdmZip();
        try {
            mkdirp.sync(filePath);
        } catch (e) {
            console.log(e);
        }

        console.log(filePath);
        oldFiles.addLocalFolder(filePath);

        oldFiles.toBuffer();

        var zipName = filePath + Date.now() + '.zip';
        oldFiles.writeZip(zipName);

        /*try {
            // get the zip file, described in the version file
            var req = http.request(_options, function(res) {
                var data = [],
                    dataLen = 0;
                res.on('data', function(chunk) {
                    data.push(chunk);
                    dataLen += chunk.length;

                }).on('end', function() {
                    var buf = new Buffer(dataLen);

                    for (var i = 0, len = data.length, pos = 0; i < len; i++) {
                        data[i].copy(buf, pos);
                        pos += data[i].length;
                    }

                    var zip = new AdmZip(buf);
                    var zipEntries = zip.getEntries();

                    //path, overwrite
                    zip.extractAllTo(filePath, true);


                    //remove backup.zip

                    //unlinkFile(zipName);
                    fs.unlink(zipName, function(err) {
                        if (err) throw err;
                        console.log('successfully deleted', zipName);
                    });
                });
            });

            req.on('error', function(err) {
                console.log(err);
                //restore old files
                zip.extractAllTo(zipName, true);
                //unlinkFile(zipName);
                fs.unlink(zipName, function(err) {
                    if (err) throw err;
                    console.log('successfully deleted', zipName);
                });
            });

            req.end();
        } catch (e) {
            console.log(e);
        }*/




        _options.encoding = 'utf-8';
        request(_options, function (error, res, body) {
            if (!error) {

                //console.log(body);
                fs.writeFile(filePath + '/test.txt', body, function (err) {
                    if (err) throw err;
                    console.log('The "data to append" was appended to file!');
                });

                var zip = new AdmZip(body);
                var zipEntries = zip.getEntries();

                //path, overwrite
                //zip.extractAllTo(filePath, true);


                //remove backup.zip

                fs.unlink(zipName, function (err) {
                    if (err) console.log(err);
                    console.log('successfully deleted', zipName);
                });


            } else {
                console.log(error);
                //restore old files
                oldFiles.extractAllTo(zipName, true);
                //unlinkFile(zipName);
                fs.unlink(zipName, function (err) {
                    if (err) console.log(err);
                    console.log('successfully deleted', zipName);
                });
                console.log('unable to connect');
            }

        });



    }


    /**
     * Initializes the test domain with several test commands.
     * @param {DomainManager} DomainManager The DomainManager for the server
     */
    function init(DomainManager) {
        if (!DomainManager.hasDomain("simple")) {
            DomainManager.registerDomain("simple", {
                major: 0,
                minor: 1
            });
        }
        DomainManager.registerCommand(
            "simple",
            "nodeUpdate",
            update,
            true,
            "", [], []
        );
    }

    exports.init = init;
    // TODO remove test export
    exports.update = update;

}());