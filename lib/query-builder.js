var Query = module.exports = function () {
  this.query = [];
};


Query.prototype.where = function (field, val, opt) {
  var prefix = '';

  if (!this._ignoreNextWherePrefix && this.query.length) {
    prefix =  (opt && opt.operator) || 'AND ';
  }

  if (opt && opt.not) prefix += '-';

  delete this._ignoreNextWherePrefix;

  this._buildingWhere = true;

  this.query.push(prefix + field + ':');

  if (val) this.equals(val);

  return this;
};


Query.prototype._ensureIsBuildingWhere = function (method) {
  if (!this._buildingWhere) {
    var msg = method + '() must be used after where() when called with these arguments';
    throw new Error(msg);
  }
};

Query.prototype.equals = function (val, opt) {
  this._ensureIsBuildingWhere('equals');

  if (typeof val === 'string'){
    if (opt && opt.contains) {
      val = '(*' + val.split(' ').join(' AND ') + '*)';
    }
    else {
      val = quote(val);
    }
  }
  this.query.push(val);
  this._buildingWhere = false;
  return this;
};


Query.prototype.in = function (values, separator) {
  this._ensureIsBuildingWhere('in');

  if (!Array.isArray(values)) values = values.split(separator || ',');


  values = values.map(function (val) {
    return typeof val === 'string' ? quote(val) : val;
  });

  this.query.push('(' + values.join(' ') + ')');

  this._buildingWhere = false;
  return this;
};


Query.prototype.begin = function () {
  if (this.query.length && !this._ignoreNextWherePrefix) this.query.push('AND ');
  this._ignoreNextWherePrefix = true;
  this.query.push('(');
  return this;
};


Query.prototype.end = function () {
  this.query.push(')');
  return this;
};


Query.prototype.or = function () {
  this._ignoreNextWherePrefix = true;
  this.query.push(' OR ');
  return this;
};


Query.prototype.any = function (conditions, opt) {
  this.begin();

  var first = true;
  for (var field in conditions) {
    if (first) first = false; else this.or();

    this.where(field).equals(conditions[field], opt);
  }

  this.end();

  return this;
};


Query.prototype.between = function (start, end, method) {
  this._ensureIsBuildingWhere('between' || method);

  if (arguments.length !== 2) throw new Error('method between() must receive 2 arguments');

  if (!start) start = '*';
  if (!end) end = '*';

  this.query.push('[' + start + ' TO ' + end + ']');

  this._buildingWhere = false;
  return this;
};


Query.prototype.betweenWithOpenIntervals = function (start, end, method) {
  this._ensureIsBuildingWhere('between' || method);

  if (arguments.length !== 2) throw new Error('method between() must receive 2 arguments');

  if (!start) start = '*';
  if (!end) end = '*';

  this.query.push('{' + start + ' TO ' + end + '}');

  this._buildingWhere = false;
  return this;
};


Query.prototype.lt = function (val) {
  return this.betweenWithOpenIntervals(null, val);
};


Query.prototype.gt = function (val) {
  return this.betweenWithOpenIntervals(val, null);
};


Query.prototype.lte = function (val) {
  return this.between(null, val);
};


Query.prototype.gte = function (val) {
  return this.between(val, null);
};


Query.prototype.build = function (opt) {
  opt = opt || {};

  var q = this.query.length ? this.query.join(' ') : (opt.default || '*:*');

  return q;
};


function quote (value) {
  return '"' + value + '"';
}
