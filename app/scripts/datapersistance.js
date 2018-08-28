class DataPersister {
    static persistSavePending() {
        const restDB = new RestaurantsDB();

        // Try to persist save_pending restaurants
        const restPromise = DataPersister.persistRestaurants(restDB);

        // Try to persist save_pending reviews
        const revPromise = DataPersister.persistReviews(restDB);

        return Promise.all([restPromise, revPromise]);
    }

    /**
     * Persist Restaurant Data to the data server
     * @param {RestaurantsDB} db 
     */
    static persistRestaurants(db) {
        return db.getPendingRestaurants()
            .then(restPending => {
                // Get the list of restaurant from pending_save_restauants store
                console.log('Pending restaurants: ', restPending.length);
                if (restPending.length == 0) {
                    return;
                }
                
                // Try to persist them
                return RestaurantFetch.favoriteRestaurants(restPending)
                    .then(restaurants => {
                        restaurants.forEach(restaurant => {
                            db.saveRestaurant(restaurant);
                            db.removeFromPendingQueue(restaurant);
                        });
                    })
                    .then(() => console.log('Restaurants data synchronized to the data server!'));
            });
    }

    /**
     * Persist Reviews Data to the data server
     * @param {RestaurantsDB} db 
     */
    static persistReviews(db) {
        return db.getPendingReviews()
        .then(revPending => {
            console.log('Pending reviews: ', revPending.length);
            if (revPending.length == 0) {
                return;
            }

            return RestaurantFetch.createReviews(revPending)
                .then(reviews => {
                    debugger;
                    reviews.forEach(review => {
                        db.saveReview(review);
                        db.removeFromPendingQueue(review);
                    });
                }).
                then(() => console.log('Reviews data synchronized to the data server!'));
        });
    }
}