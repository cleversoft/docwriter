var
    fs         = require('fs'),
    mkdirp     = require('mkdirp'),
    path       = require('path'),
    formidable = require('formidable');

/**
 * Upload file
 */
exports.upload = function(req, res) {
    var app    = req.app,
        config = app.get('config');

    var form = new formidable.IncomingForm({
        keepExtensions: true,
        uploadDir: config.upload.dir,
        maxFieldsSize: config.upload.maxSize
    });

    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');
    res.setHeader('Content-Disposition', 'inline; filename="files.json"');

    var socketConnections = app.get('socketConnections'),
        userName          = req.session.user.username,
        currentFile       = null,
        fileId            = null;

    form.onPart = function(part) {
        // Because it's impossible to track upload progress for each individual file
        // So I have to overwrite the onPart() method to track the current upload file
        currentFile = part.filename;

        // Handle part as usual
        form.handlePart(part);
    };

    form
        .on('progress', function(bytesReceived, bytesExpected) {
            if (socketConnections && socketConnections[userName]) {
                var socket = socketConnections[userName];
                socket.emit('uploadProgress', {
                    progress: 100 * bytesReceived / bytesExpected + '%',
                    filename: currentFile
                });
            }
        })
        .on('field', function(name, value) {
            if ('fid' == name) {
                fileId = value;
            }
        })
        .on('file', function(name, file) {
            // file contains size, path, name, lastModifiedDate properties
            var now   = new Date(),
                year  = String(now.getFullYear()),
                month = String(now.getMonth() + 1),
                dir   = path.join(config.upload.dir, year, month),
                name  = file.name.replace(/^\.+/, '').replace(/\s+/g, '_');
            if (!fs.existsSync(dir)) {
                mkdirp.sync(dir);
            }

            // Prevent overwriting existing files
            while (fs.existsSync(dir + '/' + name)) {
                name = name.replace(/(?:(?:_\(([\d]+)\))?(\.[^.]+))?$/, function(s, index, ext) {
                    return '_' + ((parseInt(index, 10) || 0) + 1) + (ext || '');
                });
            }

            var filePath  = path.join(dir, name),
                extention = path.extname(filePath);
            fs.rename(file.path, filePath, function() {
                res.end(JSON.stringify({
                    files: [{
                        extension: extention.length >= 1 ? extention.substr(1) : extention,
                        name: file.name,
                        size: file.size,
                        title: file.name.substring(0, file.name.length - extention.length),
                        url: [config.upload.url, year, month, name].join('/')
                    }]
                }));
            });
        })
        .on('error', function(e) {
        })
        .on('end', function() {
            res.writeHead(200, {
                'Content-Type': req.headers.accept.indexOf('application/json') !== -1 ? 'application/json' : 'text/plain'
            });
        })
        .parse(req);
};