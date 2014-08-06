var path     = require('path'),
    rootPath = path.normalize(__dirname + '/..');

module.exports = {
    development: {
        root: rootPath,
        session: {
            domain: '.docwriter.dev',
            secret: 'XrQ2Vsw2tESughz71l1B80NwqxA7z499',
            lifetime: 3600 * 1000 * 24           // 1 day
        },
        db: 'mongodb://localhost/docwriter_dev',
        upload: {
            dir: '/Volumes/data/projects_workspace/docwriter/upload',
            url: '/upload',
            maxSize: 1024 * 1024 * 1024 * 2     // 2 GB
        },
        redis: {
            host: 'localhost',
            port: 6379,
            namespace: 'docwriter'
        },
        autoSave: 0,    // Auto-save interval time in minutes
        app: {
            url: 'http://docwriter.dev',
            name: 'ZooTemplate Documents',
            copyright: "(c) 2014 ZooTemplate. All rights reserved."
        },
        jobs: {
            exportPdf: {
                command: '/Applications/wkhtmltopdf.app/Contents/MacOS/wkhtmltopdf --encoding utf-8 --outline --margin-top 30 --margin-bottom 30 --footer-spacing 10 --footer-html {footer_template} {preview_url} {pdf_path}',
                dir: '/Volumes/data/projects_workspace/docwriter/pdf',
                footerTemplate: rootPath + '/config/template/pdfFooter.html'
            }
        },
        comment: {
            disqus: {
                //shortName: null
                shortName: 'zootemplate'
            }
        }
    },
    test: {
        root: rootPath
    },
    production: {
        root: rootPath
    }
};