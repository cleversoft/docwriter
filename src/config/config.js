var path     = require('path'),
    rootPath = path.normalize(__dirname + '/..');

module.exports = {
    development: {
        root: rootPath,
        session: {
            domain: '.nodedesk.dev',
            secret: 'XrQ2Vsw2tESughz71l1B80NwqxA7z499',
            lifetime: 3600 * 1000 * 24           // 1 day
        },
        db: 'mongodb://localhost/nodedesk_dev',
        upload: {
            dir: '/Volumes/data/projects_workspace/nodedesk/upload',
            url: '/upload',
            maxSize: 1024 * 1024 * 1024 * 2     // 2 GB
        },
        redis: {
            host: 'localhost',
            port: 6379,
            namespace: 'nodedesk'
        },
        autoSave: 0,    // Auto-save interval time in minutes
        app: {
            name: 'ZooTemplate Documents'
        }
    },
    test: {
        root: rootPath
    },
    production: {
        root: rootPath
    }
};