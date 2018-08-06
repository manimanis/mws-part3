# Restaurant Reviews - Part 2

In this part we have to:

* **Use server data** instead of local memory In the first version of the application, all of the data for the restaurants was stored in the local application. You will need to change this behavior so that you are pulling all of your data from the server instead, and using the response data to generate the restaurant information on the main page and the detail page.

* **Use IndexedDB to cache JSON responses** In order to maintain offline use with the development server you will need to update the service worker to store the JSON received by your requests using the IndexedDB API. As with Stage One, any page that has been visited by the user should be available offline, with data pulled from the shell database.

* **Meet the minimum performance requirements** Once you have your app working with the server and working in offline mode, you’ll need to measure your site performance using Lighthouse.

  * Progressive Web App score should be at 90 or better.
  * Performance score should be at 70 or better.
  * Accessibility score should be at 90 or better.
You can audit your site's performance with Lighthouse by using the Audit tab of Chrome Dev Tools.

### Installing

To use this application, clone it from this repo.

Install all the required dependencies:

```
npm install
```

And than start the development server:

```
gulp serve
```

You have to run the **data server** prior to this step [Data Server](https://github.com/udacity/mws-restaurant-stage-2).
