# Changelog

## v1.1.0 (2014-08-06)

* [#11](https://github.com/nghuuphuoc/nodedesk/issues/11): Duplicating post feature
* [#15](https://github.com/nghuuphuoc/nodedesk/issues/15): Add "Reset password" feature
* [#19](https://github.com/nghuuphuoc/nodedesk/issues/19): Count the number of post views
* [#21](https://github.com/nghuuphuoc/nodedesk/issues/21): Add LIKE or DISLIKE action
* [#22](https://github.com/nghuuphuoc/nodedesk/issues/22): Use Ajax for post forms
* [#27](https://github.com/nghuuphuoc/nodedesk/issues/27): Show Disqus comments if enabled
* [#28](https://github.com/nghuuphuoc/nodedesk/issues/28): Generate slug for Vietnamese title
* [#25](https://github.com/nghuuphuoc/nodedesk/issues/25): Remove "in" from the post meta area if the post doesn't belong to any category
* [#18](https://github.com/nghuuphuoc/nodedesk/issues/18): Fix the width of TOC container
* [#29](https://github.com/nghuuphuoc/nodedesk/issues/29): Auto close the alert messages

## v1.0.1 (2014-01-20)

* [#6](https://github.com/nghuuphuoc/nodedesk/issues/6): Fix 'none' heading style

## v1.0.0 (2014-01-20)

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