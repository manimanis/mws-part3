class DataPersister {
    static persistSavePending() {
        const restDB = new RestaurantsDB();

        // Get the pending data 
        // if the operation succeeds than 
        //  - clear the pending_save flag
        //  - update the IDB store

        // Try to persist save_pending restaurants
        const restPromise = restDB.getPendingRestaurants()
            .then(restPending => {
                console.log('Pending restaurants: ', restPending.length);
                if (restPending.length == 0) {
                    return Promise.resolve();
                }

                return RestaurantFetch.favoriteRestaurants(restPending)
                    .then(() => {
                        restPending.forEach(restaurant => restDB.removeFromPendingQueue(restaurant));
                        return Promise.resolve();
                    });
            });


        // Try to persist save_pending reviews
        const revPromise = restDB.getPendingReviews()
            .then(revPending => {
                console.log('Pending reviews: ', revPending.length);
                if (revPending.length == 0) {
                    return Promise.resolve();
                }

                RestaurantFetch.createReviews(revPending)
                    .then(() => {
                        revPending.forEach(review => restDB.removeFromPendingQueue(review));
                        return Promise.resolve();
                    });
            });

        return Promise.all([restPromise, revPromise]);
    }
}