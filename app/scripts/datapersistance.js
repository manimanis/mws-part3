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
                console.log(restPending.length, ' pending restaurants');
                if (restPending.length == 0) {
                    return Promise.resolve();
                }

                return RestaurantFetch.favoriteRestaurants(restPending)
                    .then(() => {
                        restPending.forEach(restaurant => restaurant.save_pending = false);
                        restDB.saveRestaurants(restPending);
                        return Promise.resolve();
                    });
            });

        // Try to persist save_pending reviews
        const revPromise = restDB.getPendingReviews()
            .then(revPending => {
                console.log(revPending.length, ' pending reviews');
                if (revPending.length == 0) {
                    return Promise.resolve();
                }

                RestaurantFetch.updateReviews(revPending)
                    .then(() => {
                        revPending.forEach(review => review.save_pending = false);
                        restDB.saveReviews(revPending);
                        return Promise.resolve();
                    });
            });

        return Promise.all([restPromise, revPromise]);
    }
}