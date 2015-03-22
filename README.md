# solr query builder

A query builder for [Solr](http://lucene.apache.org/solr/) based in it [query syntax](http://lucene.apache.org/core/3_5_0/queryparsersyntax.html).
It has the only purpose to build the `q=` part of the solr query. For the rest of the query you may want use the [solr-node-client](https://github.com/lbdremy/solr-node-client).

## Available queries
* `where`
* `equals`
* `in`
* `begin` (begins a new block `(`)
* `end` (closes the current block `)`)
* `or`
* `any`
* `between`
* `betweenWithOpenIntervals`
* `lt`
* `gt`
* `lte`
* `gte`

## Installation

Install via npm:

```bash
$ npm install solr-query-builder
```

## Usage

```js
var SolrQueryBuilder = require('../solr/solr-query-builder'),
var qb = new SolrQueryBuilder();

// example values to query
var opt = {
  city: [ 'Florianopolis', 'New York', 'Tokyo' ],
  status: 'open',
  age: 33,
  startDate: '2014-03-22T14:04:48.691Z',
  endDate: '2018-03-22T14:04:48.691Z',
  offset_date: '2015-03-22T14:04:48.691Z',
  offset_id: '507f1f77bcf86cd799439011',
  name: 'Claus'
};

// building the query
if (opt.city) qb.where('city').in(opt.city);
if (opt.status) qb.where('status', opt.status);
if (opt.age) qb.where('age').equals(opt.age);

if (opt.startDate || opt.endDate) {
  qb.where('birthDate').between(opt.startDate, opt.endDate);
}

if (opt.offset_date && opt.offset_id) {
  qb.begin()
      .where('birthDate').lt(opt.offset_date)
      .or()
      .begin()
        .where('birthDate').equals(opt.offset_date)
        .where('_id').lt(opt.offset_id)
      .end()
    .end();
}

if (opt.name) {
  qb.any({
    firstName: opt.name,
    middleName: opt.name,
    lastName: opt.name
  }, { contains: true });
}

// parses the query object to query string
var queryResult = qb.build();


console.log(queryResult);
// city: ("Florianopolis" "New York" "Tokyo") AND status: "open" AND age: 33 AND birthDate: [2014-03-22T14:04:48.691Z TO 2018-03-22T14:04:48.691Z] AND  ( birthDate: {* TO 2015-03-22T14:04:48.691Z}  OR  ( birthDate: "2015-03-22T14:04:48.691Z" AND _id: {* TO 507f1f77bcf86cd799439011} ) ) AND  ( firstName: (*Claus*)  OR  middleName: (*Claus*)  OR  lastName: (*Claus*) )
```

## Usage with solr-node-client

```js
var solr = require('solr-client');
var SolrQueryBuilder = require('../solr/solr-query-builder'),
var qb = new SolrQueryBuilder();

// build your query using the query solr-query-builder...

var client = solr.createClient();

var query = client.createQuery()
            .q(qb.build())
            .start(0)
            .rows(10);
```

## Contributing

It is required to use [editorconfig](http://editorconfig.org/) and please write and run specs before pushing any changes:

```js
npm test
```

## License

Copyright (c) 2014 Max Claus Nunes. This software is licensed under the [MIT License](http://raw.github.com/maxcnunes/solr-query-builder/master/LICENSE).
