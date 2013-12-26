nodedesk
========

A help desk powered by NodeJs, Express and MongoDB

## Installing

### Preparing the database

From the MongoDB shell, create the database:

```bash
> use nodedesk_dev;
```

Then issue the following command to create an administrator account with username as ```administrator```, password as ```admin``` (the password can be changed in the back-end):

```bash
> db.user.insert({first_name: 'Administrator', last_name: '', email: 'admin@domain.com', hashed_password: '41d4736be7061d0dd826085dd5c5c773c4703e8a', salt: '1000412025288', username: 'administrator', role: 'root', locked: false });
```

Index the collections by the commands:

```bash
> db.category.ensureIndex({ position: 1 });
> db.category.ensureIndex({ slug: 1 });
> db.user.ensureIndex({ email: 1 });
> db.user.ensureIndex({ username: 1 });
```
