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


function CartDAO(database) {
    "use strict";

    this.db = database;

    // -------------------------------------------------------------------------
    // LAB 5
    // -------------------------------------------------------------------------

    this.getCart = function(userId, callback) {
        "use strict";

        /*
        * TODO-lab5
        *
        * LAB #5: Implement the getCart() method.
        *
        * Query the "cart" collection by userId and pass the cart to the
        * callback function.
        *
        */

        /*
        var userCart = {
            userId: userId,
            items: []
        }
        var dummyItem = this.createDummyItem();
        userCart.items.push(dummyItem); */

        // TODO-lab5 Replace all code above (in this method).
        console.log(userId);

        var userCart = {
            userId: userId,
            items: []
        }

        var query = {"userId": userId};

        var cursor = this.db.collection('cart').find(query);
        //cursor.sort( { "_id": 1 } );

        cursor.forEach(
            function(cart) {
                //userCart.items.push(cart.items);
                userCart.items = cart.items;
            },
            function(err) {
                assert.equal(err, null);
                //Proper place to pass the items for the userCart to the callback
                console.log(userCart);
                callback(userCart);
            }
        );

        // TODO Include the following line in the appropriate
        // place within your code to pass the userCart to the
        // callback.
        //callback(userCart);
    }

    // -------------------------------------------------------------------------
    // LAB 6
    // -------------------------------------------------------------------------

    this.itemInCart = function(userId, itemId, callback) {
        "use strict";

        /*
         *
         * TODO-lab6
         *
         * LAB: #6
         *
         * Write a query that will determine whether or not the cart associated
         * with the userId contains an item identified by itemId. If the cart
         * does contain the item, pass the item to the callback. If it does not,
         * pass the value null to the callback.
         *
         * NOTE: You should pass only the matching item to the callback. Do not
         * pass an array of one or more items or the entire cart.
         *
         * SUGGESTION: While it is not necessary, you might find it easier to
         * use the $ operator in a projection document in your call to find() as
         * a means of selecting the matching item. Again, take care to pass only
         * the matching item (not an array) to the callback. See:
         * https://docs.mongodb.org/manual/reference/operator/projection/positional/
         *
         * As context for this method to better understand its purpose, look at
         * how cart.itemInCart is used in the mongomart.js app.
         *
         */ 

        // TODO-lab6 Replace all code above (in this method).

        console.log('Trying to add an item to the cart ----------------------------------------------');
        console.log('userId: ', userId);
        console.log('itemId: ', itemId);

        // WAY1: Use MongoDB 'findOne' and inspect the Array with JAVASCRIPT 'find'
        // ---------------------------------------------------------------------
        
        // function to pass to the Javascript 'find' function to search in arrays
        /*
        function isItemId(item) { 
            console.log('item._id in function isItemId: ', item._id);
            return item._id == itemId;
        }

        var query = {"userId": userId};

        this.db.collection('cart').findOne(query, function(err, cart){
            assert.equal(null, err);
            //console.log(cart);

            // JAVASCRIPT: Find an object in an array (cart.items) by one of its properties
            var itemInCart = cart.items.find(isItemId); //send the function as parameter
            
            if (itemInCart === undefined){
                // the cart does NOT contain the item
                callback(null); 
                
            } else {
                // the cart already contains the item
                callback(itemInCart);
            } 
        });
        */

        // WAY2: Using the Aggregation framework
        // ---------------------------------------------------------------------
        
        var itemInCart;

        // 'itemId' is unique so the pipeline will always return 0 or 1 matches 
        var pipeline = [
            { $match: { "userId": userId } }, 
            { $project: { items: 1, _id: 0 } }, 
            { $unwind: "$items" },
            { $match: { "items._id": itemId } }
        ];

        // 2 ways of inspecting results of the Aggregations
        // a) We don't need a cursor because only 0 or 1 matches
        this.db.collection('cart').aggregate(pipeline).limit(1).next(function(err, item) {
            assert.equal(null, err);

            itemInCart = item.items;

            if (itemInCart === undefined){
                // the cart does NOT contain the item 
                console.log('callback con null');
                callback(null); 
                
            } else {
                // the cart already contains the item
                console.log('callback con el item encontrado');
                callback(itemInCart);
            } 
            
        });

        /* b) Although only 0 or 1 matches we can still use a cursor if we want to
        var cursor = this.db.collection('cart').aggregate(pipeline);
        
        cursor.forEach(
            function(item) {
                itemInCart = item.items;
            },
            
            // what to do when the cursor is exhausted (or in the case of an error)
            function(err) {
                
                //console.log(err);  // prints null
                assert.equal(err, null);

                console.log('Cursor rama err, el valor de itemInCart es: ');
                console.log(itemInCart);
                if (itemInCart === undefined){
                    // the cart does NOT contain the item 
                    console.log('callback con null');
                    callback(null); 
                    
                } else {
                    // the cart already contains the item
                    console.log('callback con el item encontrado');
                    callback(itemInCart);
                } 
            }
        ); 
        */   

    }


    /*
     * This solution is provide as an example to you of several query
     * language features that are valuable in update operations.
     * This method adds the item document passed in the item parameter to the
     * user's cart. Note that this solution works regardless of whether the
     * cart already contains items or is empty. addItem will be called only
     * if the cart does not already contain the item. The route handler:
     * router.post("/user/:userId/cart/items/:itemId"...
     * handles this. Please review how that method works to have a complete
     * understanding of how addItem is used.
     *
     * NOTE: One may use either updateOne() or findOneAndUpdate() to
     * write this method. We did not discuss findOneAndUpdate() in class,
     * but it provides a very straightforward way of solving this problem.
     * See the following for documentation:
     * http://mongodb.github.io/node-mongodb-native/2.0/api/Collection.html#findOneAndUpdate
     *
     */
    this.addItem = function(userId, item, callback) {
        "use strict";

        // Will update the first document found matching the query document.
        this.db.collection("cart").findOneAndUpdate(
            // query for the cart with the userId passed as a parameter.
            {userId: userId},
            // update the user's cart by pushing an item onto the items array
            {"$push": {items: item}},
            // findOneAndUpdate() takes an options document as a parameter.
            // Here we are specifying that the database should insert a cart
            // if one doesn't already exist (i.e. "upsert: true") and that
            // findOneAndUpdate() should pass the updated document to the
            // callback function rather than the original document
            // (i.e., "returnOriginal: false").
            {
                upsert: true,
                returnOriginal: false
            },
            // Because we specified "returnOriginal: false", this callback
            // will be passed the updated document as the value of result.
            function(err, result) {
                assert.equal(null, err);
                // To get the actual document updated we need to access the
                // value field of the result.
                callback(result.value);
            });

        /*

          Without all the comments this code looks written as follows.

        this.db.collection("cart").findOneAndUpdate(
            {userId: userId},
            {"$push": {items: item}},
            {
                upsert: true,
                returnOriginal: false
            },
            function(err, result) {
                assert.equal(null, err);
                callback(result.value);
            });
        */

    };
    

    // -------------------------------------------------------------------------
    // LAB 7
    // -------------------------------------------------------------------------

    this.updateQuantity = function(userId, itemId, quantity, callback) {
        "use strict";

        /*
        * TODO-lab7
        *
        * LAB #7: Update the quantity of an item in the user's cart in the
        * database by setting quantity to the value passed in the quantity
        * parameter. If the value passed for quantity is 0, remove the item
        * from the user's cart stored in the database.
        *
        * Pass the updated user's cart to the callback.
        *
        * NOTE: Use the solution for addItem as a guide to your solution for
        * this problem. There are several ways to solve this. By far, the
        * easiest is to use the $ operator. See:
        * https://docs.mongodb.org/manual/reference/operator/update/positional/
        *
        */

        /*
        var userCart = {
            userId: userId,
            items: []
        }
        var dummyItem = this.createDummyItem();
        dummyItem.quantity = quantity;
        userCart.items.push(dummyItem);
        callback(userCart);
        */

        // TODO-lab7 Replace all code above (in this method).
        console.log('Trying to update the quantity of an item ----------------------------------------------');
        //console.log('userId: ', userId);
        //console.log('itemId: ', itemId);
        //console.log('quantity: ', quantity);

        if (quantity == 0) {
            console.log('Actualiza con cantidad 0 - elimina item del carrito');
            // remove the item from the user's cart
            this.db.collection("cart").findOneAndUpdate(
                    { 
                        userId: userId, "items._id": itemId 
                    },
                    {
                        $pull: { items: { _id: itemId} } // remove from 'items' array the element with '_id' = itemId
                    },
                    {
                        returnOriginal: false
                    },
                    function(err, updatedCart) {
                        assert.equal(null, err);
                        //console.log(updatedCart.value);
                        callback(updatedCart.value);
                    }
                );

        } else {
            // update the quantity property
            this.db.collection("cart").findOneAndUpdate(
            //this.db.collection("cart").updateOne(  // NO FUNCIONA   
                { 
                    userId: userId, "items._id": itemId 
                },
                {
                    $set: {"items.$.quantity" : quantity}
                },
                {
                    returnOriginal: false
                },
                function(err, updatedCart) {
                    assert.equal(null, err);
                    //console.log(updatedCart.value);
                    callback(updatedCart.value);
                }
            );
        }

    }

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
            quantity: 1,
            reviews: []
        };

        return item;
    }

}


module.exports.CartDAO = CartDAO;
