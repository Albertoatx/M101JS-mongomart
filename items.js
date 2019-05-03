/*
  Copyright (c) 2008 - 2016 MongoDB, Inc. <http://mongodb.com>

  Licensed under the Apache License, Version 2.0 (the "License");
  you may not use this file except in compliance with the License.
  You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

  Unless required by applicable law or agreed to in writing, software
  distributed under the License is distributed on an "AS IS" BASIS,
  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
  See the License for the specific language governing permissions and
  limitations under the License.
*/


var MongoClient = require('mongodb').MongoClient,
    assert = require('assert');


function ItemDAO(database) {
    "use strict";

    this.db = database;

    // -------------------------------------------------------------------------
    // LAB 1 
    // -------------------------------------------------------------------------
    this.getCategories = function(callback) {
        "use strict";

        /*
        * TODO-lab1A
        *
        * LAB #1A: Implement the getCategories() method.
        *
        * Write an aggregation query on the "item" collection to return the
        * total number of items in each category. The documents in the array
        * output by your aggregation should contain fields for "_id" and "num".
        *
        * HINT: Test your mongodb query in the shell first before implementing
        * it in JavaScript.
        *
        * In addition to the categories created by your aggregation query,
        * include a document for category "All" in the array of categories
        * passed to the callback. The "All" category should contain the total
        * number of items across all categories as its value for "num". The
        * most efficient way to calculate this value is to iterate through
        * the array of categories produced by your aggregation query, summing
        * counts of items in each category.
        *
        * Ensure categories are organized in alphabetical order before passing
        * to the callback.
        *
        */
        
        /*
        var categories = [];
        
        var category = {
            _id: "All",
            num: 9999
        };

        categories.push(category);
        */
    
        // TODO-lab1A Replace all code above (in this method).
        var categories = [];
        var total = 0;

        var pipeline = [
            { $project: { category: 1, _id: 0 } }, 
            { $group: {
                _id: "$category" ,
                num: { $sum: 1 }
            } },
            { $sort: { _id: 1 } }  
        ];

        //var cursor = this.db.collection('item').find({});
        var cursor = this.db.collection('item').aggregate(pipeline);
        
        cursor.forEach(
            function(category) {
                //console.log(category);
                categories.push(category);
            },
            
            // what to do when the cursor is exhausted (or in the case of an error)
            function(err) {
                
                //console.log(err);  // prints null
                assert.equal(err, null);

                //calculate the total number of items for 'All' category
                categories.forEach(function(category) {
                    total = total + category.num;
                });

                var category = {
                    _id: "All",
                    num: total
                };
                
                // 'unshift' adds the 'All' category as the 1st member of the array
                categories.unshift(category);

                //console.log(categories);

                callback(categories); //HERE is the appropiate place to pass the categories array to the callback
            }
        );        

        // TODO Include the following line in the appropriate
        // place within your code to pass the categories array to the
        // callback.
        //callback(categories);
    }


    this.getItems = function(category, page, itemsPerPage, callback) {
        "use strict";

        /*
         * TODO-lab1B
         *
         * LAB #1B: Implement the getItems() method.
         *
         * Create a query on the "item" collection to select only the items
         * that should be displayed for a particular page of a given category.
         * The category is passed as a parameter to getItems().
         *
         * Use sort(), skip(), and limit() and the method parameters: page and
         * itemsPerPage to identify the appropriate products to display on each
         * page. Pass these items to the callback function.
         *
         * Sort items in ascending order based on the _id field. You must use
         * this sort to answer the final project questions correctly.
         *
         * Note: Since "All" is not listed as the category for any items,
         * you will need to query the "item" collection differently for "All"
         * than you do for other categories.
         *
         */
        
        /*
        var pageItem = this.createDummyItem();
        var pageItems = [];
        for (var i=0; i<5; i++) {
            pageItems.push(pageItem);
        }
        */

        // TODO-lab1B Replace all code above (in this method).

        //console.log('category in getItems');
        //console.log(category);
        var pageItems = [];
        var query;

        if (category == 'All') {
            query = {};
        } else {
            query = {"category": category};
        }
        
        //console.log(query);

        /* var cursor = this.db.collection('item')
                                     .find(query)
                                     .sort( { "_id": 1 } )
                                     .skip(itemsPerPage * page)
                                     .limit(itemsPerPage); */

        var cursor = this.db.collection('item').find(query);
        cursor.sort( { "_id": 1 } );
        cursor.skip(itemsPerPage * page);
        cursor.limit(itemsPerPage);

        cursor.forEach(
            function(pageItem) {
                pageItems.push(pageItem); 
            },
            function(err) {
                assert.equal(err, null);
                //console.log(pageItems);
                callback(pageItems); //HERE is the appropiate place to pass the items for the selected page to the callback
            }
        );

        // TODO Include the following line in the appropriate
        // place within your code to pass the items for the selected page
        // to the callback.
        // callback(pageItems);
    }

    // Used for PAGINATION
    this.getNumItems = function(category, callback) {
        "use strict";

        var numItems = 0;

        /*
         * TODO-lab1C:
         *
         * LAB #1C: Implement the getNumItems method()
         *
         * Write a query that determines the number of items in a category
         * and pass the count to the callback function. The count is used in
         * the mongomart application for pagination. The category is passed
         * as a parameter to this method.
         *
         * See the route handler for the root path (i.e. "/") for an example
         * of a call to the getNumItems() method.
         *
         */
        
        var query;

        if (category == 'All') {
            query = {};
        } else {
            query = {"category": category};
        }
        
        //console.log(query);

       // Be careful! 'COUNT' does not return a cursor
       this.db.collection('item').find(query)
                                 .count(
                                    function (err, numItems) {
                                        //console.log(numItems);
                                        assert.equal(null, err);
                                        callback(numItems);
                                    }
                                  );
                                     
         // TODO Include the following line in the appropriate
         // place within your code to pass the count to the callback.
        //callback(numItems);
    }


    // -------------------------------------------------------------------------
    // LAB 2 
    // -------------------------------------------------------------------------

    this.searchItems = function(query, page, itemsPerPage, callback) {
        "use strict";

        /*
         * TODO-lab2A
         *
         * LAB #2A: Implement searchItems()
         *
         * Using the value of the query parameter passed to searchItems(),
         * perform a text search against the "item" collection.
         *
         * Sort the results in ascending order based on the _id field.
         *
         * Select only the items that should be displayed for a particular
         * page. For example, on the first page, only the first itemsPerPage
         * matching the query should be displayed.
         *
         * Use limit() and skip() and the method parameters: page and
         * itemsPerPage to select the appropriate matching products. Pass these
         * items to the callback function.
         *
         * searchItems() depends on a text index. Before implementing
         * this method, create a SINGLE text index on title, slogan, and
         * description. You should simply do this in the mongo shell.
         *
         */

        /*
        var item = this.createDummyItem();
        var items = [];
        for (var i=0; i<5; i++) {
            items.push(item);
        } 
        */

        // TODO-lab2A Replace all code above (in this method).
        //console.log(query);

        var items = [];

        var queryDoc;
        if (query.trim() == "") {
            queryDoc = {};
        } else {
            queryDoc = { "$text": {"$search": query} };
        }

        //var cursor = this.db.collection('item').find( { $text: { $search: query } } );
        var cursor = this.db.collection('item').find(queryDoc);
        cursor.sort( { "_id": 1 } );
        cursor.skip(itemsPerPage * page);
        cursor.limit(itemsPerPage);

        cursor.forEach(
            function(item) {
                items.push(item); 
            },
            function(err) {
                assert.equal(err, null);
                //console.log(items);
                // Proper place to pass the items for the selected page to the callback
                callback(items); 
            }
        );

        // TODO Include the following line in the appropriate
        // place within your code to pass the items for the selected page
        // of search results to the callback.
        //callback(items);
    }


    // Used for PAGINATION
    this.getNumSearchItems = function(query, callback) {
        "use strict";

        var numItems = 0;

        /*
        * TODO-lab2B
        *
        * LAB #2B: Using the value of the query parameter passed to this
        * method, count the number of items in the "item" collection matching
        * a text search. Pass the count to the callback function.
        *
        * getNumSearchItems() depends on the same text index as searchItems().
        * Before implementing this method, ensure that you've already created
        * a SINGLE text index on title, slogan, and description. You should
        * simply do this in the mongo shell.
        */

        var queryDoc;

        if (query.trim() == "") {
            queryDoc = {};
        } else {
            queryDoc = { "$text": {"$search": query} };
        }
        
       // Be careful! 'COUNT' does not return a cursor
       this.db.collection('item').find(queryDoc)
                                 .count(
                                    function (err, numItems) {
                                        //console.log(numItems);
                                        assert.equal(null, err);
                                        callback(numItems);
                                    }
                                  );

        //callback(numItems);
    }


    // -------------------------------------------------------------------------
    // LAB 3
    // -------------------------------------------------------------------------

    this.getItem = function(itemId, callback) {
        "use strict";

        /*
         * TODO-lab3
         *
         * LAB #3: Implement the getItem() method.
         *
         * Using the itemId parameter, query the "item" collection by
         * _id and pass the matching item to the callback function.
         *
         */

        //var item = this.createDummyItem();

        // TODO-lab3 Replace all code above (in this method).
        //console.log(itemId);

        var queryDoc = { "_id": itemId };

        this.db.collection('item').findOne(queryDoc, function (err, item) {

            assert.equal(null, err);
            callback(item);
        });

        // TODO Include the following line in the appropriate
        // place within your code to pass the matching item
        // to the callback.
        //callback(item);
    }

    // This function always shows the same items (it is only for visual purposes)
    this.getRelatedItems = function(callback) {
        "use strict";

        this.db.collection("item").find({})
            .limit(4)
            .toArray(function(err, relatedItems) {
                assert.equal(null, err);
                callback(relatedItems);
            });
    };


    // -------------------------------------------------------------------------
    // LAB 4
    // -------------------------------------------------------------------------

    this.addReview = function(itemId, comment, name, stars, callback) {
        "use strict";

        /*
         * TODO-lab4
         *
         * LAB #4: Implement addReview().
         *
         * Using the itemId parameter, update the appropriate document in the
         * "item" collection with a new review. Reviews are stored as an
         * array value for the key "reviews". Each review has the fields:
         * "name", "comment", "stars", and "date".
         *
         */

        var reviewDoc = {
            name: name,
            comment: comment,
            stars: stars,
            date: Date.now()
        }

        console.log(itemId);
        console.log(reviewDoc);

        // TODO replace the following two lines with your code that will
        // update the document with a new review.
        //var doc = this.createDummyItem();
        //doc.reviews = [reviewDoc];

        this.db.collection('item').updateOne(
          {
            _id: itemId
          },
          {
            $push: {
              reviews: {
                $each: [reviewDoc]
              }
            }
          },
          function (err, doc) {

            assert.equal(null, err);

            // Proper place to pass the UPDATED doc to the callbac
            callback(doc);
          } 
        );
          

        // TODO Include the following line in the appropriate
        // place within your code to pass the updated doc to the
        // callback.
        //callback(doc);
    }


    // This is a DUMMY method (don't call it when doing the LAB exercices)
    this.createDummyItem = function() {
        "use strict";

        var item = {
            _id: 1,
            title: "Gray Hooded Sweatshirt",
            description: "The top hooded sweatshirt we offer",
            slogan: "Made of 100% cotton",
            stars: 0,
            category: "Apparel",
            img_url: "/img/products/hoodie.jpg",
            price: 29.99,
            reviews: []
        };

        return item;
    }
}


module.exports.ItemDAO = ItemDAO;
