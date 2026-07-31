// PASS 0 — paste into browser DevTools console while any legacy tool from
// legacy/ is open via file:// from the SAME folder. Downloads a JSON backup.
(function () {
  var PREFIXES = ['bb', 'bbbacklabel', 'bbcarton', 'bbstand', 'bbinv'];
  var IDB_DBS = ['BBLabelDB', 'bb_filestore_v1'];

  function shouldKey(k) {
    return PREFIXES.some(function (p) { return k.indexOf(p) === 0; });
  }

  function readLocalStorage() {
    var out = {};
    for (var i = 0; i < localStorage.length; i++) {
      var key = localStorage.key(i);
      if (!shouldKey(key)) continue;
      try {
        out[key] = JSON.parse(localStorage.getItem(key));
      } catch (e) {
        out[key] = localStorage.getItem(key);
      }
    }
    return out;
  }

  function readIdb(dbName) {
    return new Promise(function (resolve) {
      var req = indexedDB.open(dbName);
      req.onerror = function () { resolve({ db: dbName, error: 'open failed', stores: {} }); };
      req.onsuccess = function (e) {
        var db = e.target.result;
        var names = Array.from(db.objectStoreNames);
        var stores = {};
        var pending = names.length;
        if (!pending) {
          db.close();
          resolve({ db: dbName, stores: stores });
          return;
        }
        names.forEach(function (storeName) {
          var tx = db.transaction(storeName, 'readonly');
          var store = tx.objectStore(storeName);
          var getAll = store.getAll();
          getAll.onsuccess = function () {
            stores[storeName] = getAll.result;
            pending--;
            if (!pending) {
              db.close();
              resolve({ db: dbName, stores: stores });
            }
          };
          getAll.onerror = function () {
            stores[storeName] = { error: 'getAll failed' };
            pending--;
            if (!pending) {
              db.close();
              resolve({ db: dbName, stores: stores });
            }
          };
        });
      };
    });
  }

  var stamp = new Date().toISOString().replace(/[:.]/g, '-');
  var payload = {
    exportedAt: new Date().toISOString(),
    origin: location.href,
    localStorage: readLocalStorage(),
    indexedDB: []
  };

  Promise.all(IDB_DBS.map(readIdb)).then(function (dbs) {
    payload.indexedDB = dbs;
    var blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    var a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'bb-browser-data-backup-' + stamp + '.json';
    document.body.appendChild(a);
    a.click();
    a.remove();
    console.log('Backup downloaded:', a.download, payload);
  });
})();
