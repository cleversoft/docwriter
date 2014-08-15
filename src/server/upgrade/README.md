# Upgrade from 1.1.0 to 2.0.0

## Step 1: Renaming DB fields

```
$ mongo
> use docwriter_dev;
> db.post.update({}, { $rename: { 'created_user': 'created' }}, false, true);
> db.post.update({}, { $rename: { 'created_date': 'created.date' }}, false, true);
> db.post.update({}, { $rename: { 'updated_user': 'updated' }}, false, true);
> db.post.update({}, { $rename: { 'updated_date': 'updated.date' }}, false, true);
```

## Step 2: Running script

```
$ cd <src/server>
$ NODE_ENV=... node 1.1.0_to_2.0.0.js
```