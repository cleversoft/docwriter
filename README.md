nodedesk
========

A tool for writing software user guides, written in NodeJs, Express and MongoDB.

It has been using in productions at:

* [ZooTemplate Documents](http://docs.zootemplate.com)
* [ZooExtension Documents](http://docs.zooextension.com)

![Front-end screenshot](docs/frontend.png)

## Features

**Front-end**
    * The guide URLs are friendly (for example, ```http://domain/post/this-is-guide-slug``` instead of ```http://domain/post/52c6613c3320e53e09000003```)
    * Generate the table of contents of guide automatically

**Back-end**
    * Organize guides by categories. Each post can belong to one or many categories
    * Manage users
    * Guides are formats in Markdown. Administrators can preview the guide right in the back-end
    * The administrator can publish/unpublish guides or save guides as draft one
    * The guide is exported to PDF automatically right after saving/publishing it
    * Auto save guides after given time. This feature can be enabled/disabled

## Installing

### Installing NodeJS modules

From the ```src``` directory, execute the command below to install NodeJS modules defined in ```package.json```:

```bash
$ sudo npm install
```

### Preparing the database

From the MongoDB shell, create the database:

```bash
> use nodedesk_dev;
```

Then issue the following command to create an administrator account with username as ```administrator```, password as ```admin``` (the password can be changed in the back-end):

```bash
> db.user.insert({
    first_name: 'Administrator', last_name: '', email: 'admin@domain.com',
    hashed_password: '41d4736be7061d0dd826085dd5c5c773c4703e8a', salt: '1000412025288',
    username: 'administrator', role: 'root', locked: false
});
```

Index the collections by the commands:

```bash
> db.category.ensureIndex({ position: 1 });
> db.category.ensureIndex({ slug: 1 });
> db.post.ensureIndex({ slug: 1 });
> db.user.ensureIndex({ email: 1 });
> db.user.ensureIndex({ username: 1 });
```

## Running

Run the app:

```bash
$ cd <SRC_DIRECTORY>
$ node app.js
```

Then access the browser at ```http://localhost:3000```

## License

NodeDesk is written by @nghuuphuoc ([Twitter](http://twitter.com/nghuuphuoc) / [Github](http://github.com/nghuuphuoc)), and licensed under the MIT license.

```
The MIT License (MIT)

Copyright (c) 2013 Nguyen Huu Phuoc

Permission is hereby granted, free of charge, to any person obtaining a copy of
this software and associated documentation files (the "Software"), to deal in
the Software without restriction, including without limitation the rights to
use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of
the Software, and to permit persons to whom the Software is furnished to do so,
subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS
FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER
IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
```
