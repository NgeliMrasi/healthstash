const initSqlJs = require('sql.js');
const fs = require('fs');

let db;

(async () => {
  const SQL = await initSqlJs();
  if (fs.existsSync('healthstash.db')) {
    const fileBuffer = fs.readFileSync('healthstash.db');
    db = new SQL.Database(fileBuffer);
  } else {
    db = new SQL.Database();
    db.run(`CREATE TABLE IF NOT EXISTS txlog (
      id INTEGER PRIMARY KEY,
      type TEXT,
      actor TEXT,
      counterparty TEXT,
      amount TEXT,
      hash TEXT,
      timestamp TEXT
    )`);
    persist();
  }
})();

function persist() {
  const data = db.export();
  fs.writeFileSync('healthstash.db', Buffer.from(data));
}

function insertTx(type, actor, counterparty, amount, hash) {
  db.run(
    "INSERT INTO txlog (type, actor, counterparty, amount, hash, timestamp) VALUES (?,?,?,?,?,datetime('now'))",
    [type, actor, counterparty, amount, hash]
  );
  persist();
}

function getTxLog() {
  const res = db.exec("SELECT * FROM txlog ORDER BY timestamp DESC");
  if (res.length === 0) return [];
  const cols = res[0].columns;
  return res[0].values.map(row => {
    const obj = {};
    cols.forEach((c, i) => obj[c] = row[i]);
    return obj;
  });
}

module.exports = { insertTx, getTxLog };
