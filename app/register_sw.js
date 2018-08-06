if (navigator.serviceWorker) {
    navigator.serviceWorker.register('/sw.js')
    .then(function () {
        console.log('Service worker successefuly registered!')
    })
    .catch(function (err) {
        console.log('Service worker failed to start', err);
    });
}