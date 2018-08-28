importScripts('worker.bundle.js');

var timeoutId = null;

function startWorking(e) {
    if (timeoutId) {
        clearTimeout(timeoutId);
    }
    persistData();
}

function persistData() {
    console.log('Web worker - persisting data!');
    DataPersister.persistSavePending()
        .then(() => console.log('Web Worker - all data is persisted'))
        .then(() => postMessage('done'))
        .catch(error => {
            console.log('Data server is offline trying in 10 s');
            timeoutId = setTimeout(persistData, 10000);
        });
}

this.onmessage = startWorking;