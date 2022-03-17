export function pluralize(name, count) {
  if (count === 1) {
    return name;
  }
  return name + 's';
}
//indexedDB is asynchronous and event driven
// localforage for indexeddb
export function idbPromise(storeName, method, object) {
  return new Promise((resolve, reject) => {
    // Open connection
    const request = window.indexedDB.open('shop-shop', 1);

    let db, tx, store; // initialize db, transactiobn and store

    // if version changes
    request.onupgradeneeded = function (e) {
      const db = request.result;

      // create object store for each type of data and set "primary" key index to be the `_id` of the data
      db.createObjectStore('products', { keyPath: '_id' });
      db.createObjectStore('categories', { keyPath: '_id' });
      db.createObjectStore('cart', { keyPath: '_id' });
    };

    request.onerror = function (e) {
      console.log('There was an error');
    };

    request.onsuccess = function (e) {
      // save a reference of the database to the `db` variable
      db = request.result;
      // open a transaction do whatever we pass into `storeName` (must match one of the object store names)
      tx = db.transaction(storeName, 'readwrite');
      store = tx.objectStore(storeName);

      db.onerror = function (e) {
        console.log('error: ', e);
      };

      switch (method) {
        case 'put':
          store.put(object);
          resolve(object);
          break;
        case 'get':
          const all = store.getAll();
          all.onsuccess = function () {
            resolve(all.result);
          };
          break;
        case 'delete':
          store.delete(object._id);
          break;
        default:
          console.log('No Valid method');
          break;
      }

      tx.oncomplete = function () {
        db.close();
      };
    };
  });
}
