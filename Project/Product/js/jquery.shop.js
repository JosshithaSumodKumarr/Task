(function( $ ) {
	$.Shop = function( element ) {
		this.$element = $( element );
		this.init();
	};
	
	$.Shop.prototype = {
		init: function() {
		
		    // Properties
		
			this.cartPrefix = "Shopping Cart"; // Prefix string to be prepended to the cart's name in the session storage
			this.cartName = this.cartPrefix + "cart"; // Cart name in the session storage
			this.shippingRates = this.cartPrefix + "shipping-rates"; // Shipping rates key in the session storage
			this.total = this.cartPrefix + "total"; // Total key in the session storage
			this.storage = sessionStorage; // shortcut to the sessionStorage object
			
			
			this.$formAddToCart = this.$element.find( "form.add-to-cart" ); // Forms for adding items to the cart
			this.$formCart = this.$element.find( "#shopping-cart" ); // Shopping cart form
			this.$shipping = this.$element.find( "#sshipping" ); // Element that displays the shipping rates
			this.$subTotal = this.$element.find( "#stotal" ); // Element that displays the subtotal charges
			this.$shoppingCartActions = this.$element.find( "#shopping-cart-actions" ); // Cart actions links
			this.$updateCartBtn = this.$shoppingCartActions.find( "#update-cart" ); // Update cart button
			this.$emptyCartBtn = this.$shoppingCartActions.find( "#empty-cart" ); // Empty cart button
			
			
			
			this.currency = "Rs"; // HTML entity of the currency to be displayed in the layout
			this.currencyString = "Rs"; // Currency symbol as textual string
			
			
			// Method invocation
			
			this.createCart();
			this.handleAddToCartForm();
			this.emptyCart();
			this.updateCart();
			this.displayCart();
			this.deleteProduct();
			this.displayUserDetails();
			
			
		},
		
		// Public methods
		
		// Creates the cart keys in the session storage
		
		createCart: function() {
			if( this.storage.getItem( this.cartName ) == null ) {
			
				var cart = {};
				cart.items = [];
			
				this.storage.setItem( this.cartName, this._toJSONString( cart ) );
				this.storage.setItem( this.shippingRates, "0" );
				this.storage.setItem( this.total, "0" );
			}
		},
		
		

		// Delete a product from the shopping cart

		deleteProduct: function() {
			var self = this;
			if( self.$formCart.length ) {
				var cart = this._toJSONObject( this.storage.getItem( this.cartName ) );
				var items = cart.items;

				$( document ).on( "click", ".pdelete a", function( e ) {
					e.preventDefault();
					var productName = $( this ).data( "product" );
					var newItems = [];
					for( var i = 0; i < items.length; ++i ) {
						var item = items[i];
						var product = item.product;	
						if( product == productName ) {
							items.splice( i, 1 );
						}
					}
					newItems = items;
					var updatedCart = {};
					updatedCart.items = newItems;

					var updatedTotal = 0;
					var totalQty = 0;
					if( newItems.length == 0 ) {
						updatedTotal = 0;
						totalQty = 0;
					} else {
						for( var j = 0; j < newItems.length; ++j ) {
							var prod = newItems[j];
							var sub = prod.price * prod.qty;
							updatedTotal += sub;
							totalQty += prod.qty;
						}
					}

					self.storage.setItem( self.total, self._convertNumber( updatedTotal ) );

					self.storage.setItem( self.cartName, self._toJSONString( updatedCart ) );
					$( this ).parents( "tr" ).remove();
					self.$subTotal[0].innerHTML = self.currency + " " + self.storage.getItem( self.total );
				});
			}
		},
		
		// Displays the shopping cart
		
		displayCart: function() {
			if( this.$formCart.length ) {
				var cart = this._toJSONObject( this.storage.getItem( this.cartName ) );
				var items = cart.items;
				var $tableCart = this.$formCart.find( ".shopping-cart" );
				var $tableCartBody = $tableCart.find( "tbody" );

				if( items.length == 0 ) {
					$tableCartBody.html( "" );	
				} else {
				
				
					for( var i = 0; i < items.length; ++i ) {
						var item = items[i];
						var product = item.product;
						var price = this.currency + " " + item.price;
						var qty = item.qty;
						var html = "<tr><td class='pname'>" + product + "</td>" + "<td class='pqty'><input type='text' value='" + qty + "' class='qty'/></td>";
					    	html += "<td class='pprice'>" + price + "</td><td class='pdelete'><a href='' data-product='" + product + "'>&times;</a></td></tr>";
					
						$tableCartBody.html( $tableCartBody.html() + html );
					}

				}

				if( items.length == 0 ) {
					this.$subTotal[0].innerHTML = this.currency + " " + 0.00;
				} else {	
				
					var total = this.storage.getItem( this.total );
					this.$subTotal[0].innerHTML = this.currency + " " + total;
				}
			} else if( this.$checkoutCart.length ) {
				var checkoutCart = this._toJSONObject( this.storage.getItem( this.cartName ) );
				var cartItems = checkoutCart.items;
				var $cartBody = this.$checkoutCart.find( "tbody" );

				if( cartItems.length > 0 ) {
				
					for( var j = 0; j < cartItems.length; ++j ) {
						var cartItem = cartItems[j];
						var cartProduct = cartItem.product;
						var cartPrice = this.currency + " " + cartItem.price;
						var cartQty = cartItem.qty;
						var cartHTML = "<tr><td class='pname'>" + cartProduct + "</td>" + "<td class='pqty'>" + cartQty + "</td>" + "<td class='pprice'>" + cartPrice + "</td></tr>";
					
						$cartBody.html( $cartBody.html() + cartHTML );
					}
				} else {
					$cartBody.html( "" );	
				}

				if( cartItems.length > 0 ) {
				
					var cartTotal = this.storage.getItem( this.total );
					
					var subTot = this._convertString( cartTotal ) + this._convertString( cartShipping );
				
					this.$subTotal[0].innerHTML = this.currency + " " + this._convertNumber( subTot );
					
				} else {
					this.$subTotal[0].innerHTML = this.currency + " " + 0.00;
						
				}
			
			}
		},
		
		// Empties the cart by calling the _emptyCart() method
		// @see $.Shop._emptyCart()
		
		emptyCart: function() {
			var self = this;
			if( self.$emptyCartBtn.length ) {
				self.$emptyCartBtn.on( "click", function() {
					self._emptyCart();
				});
			}
		},
		
		// Updates the cart
		
		updateCart: function() {
			var self = this;
		  if( self.$updateCartBtn.length ) {
			self.$updateCartBtn.on( "click", function() {
				var $rows = self.$formCart.find( "tbody tr" );
				var cart = self.storage.getItem( self.cartName );
				var shippingRates = self.storage.getItem( self.shippingRates );
				var total = self.storage.getItem( self.total );
				
				var updatedTotal = 0;
				var totalQty = 0;
				var updatedCart = {};
				updatedCart.items = [];
				
				$rows.each(function() {
					var $row = $( this );
					var pname = $.trim( $row.find( ".pname" ).text() );
					var pqty = self._convertString( $row.find( ".pqty > .qty" ).val() );
					var pprice = self._convertString( self._extractPrice( $row.find( ".pprice" ) ) );
					
					var cartObj = {
						product: pname,
						price: pprice,
						qty: pqty
					};
					
					updatedCart.items.push( cartObj );
					
					var subTotal = pqty * pprice;
					updatedTotal += subTotal;
					totalQty += pqty;
				});
				
				self.storage.setItem( self.total, self._convertNumber( updatedTotal ) );
				self.storage.setItem( self.cartName, self._toJSONString( updatedCart ) );
				
			});
		  }
		},
		
		// Adds items to the shopping cart
		
		handleAddToCartForm: function() {
			var self = this;
			self.$formAddToCart.each(function() {
				var $form = $( this );
				var $product = $form.parent();
				var price = self._convertString( $product.data( "price" ) );
				var name =  $product.data( "name" );
				
				$form.on( "submit", function() {
					var qty = self._convertString( $form.find( ".qty" ).val() );
					var subTotal = qty * price;
					var total = self._convertString( self.storage.getItem( self.total ) );
					var sTotal = total + subTotal;
					self.storage.setItem( self.total, sTotal );
					self._addToCart({
						product: name,
						price: price,
						qty: qty
					});
				});
			});
		},
		
		// Handles the checkout form by adding a validation routine and saving user's info into the session storage
		
		handleCheckoutOrderForm: function() {
			var self = this;
			if( self.$checkoutOrderForm.length ) {
				var $sameAsBilling = $( "#same-as-billing" );
				$sameAsBilling.on( "change", function() {
					var $check = $( this );
					if( $check.prop( "checked" ) ) {
						$( "#fieldset-shipping" ).slideUp( "normal" );
					} else {
						$( "#fieldset-shipping" ).slideDown( "normal" );
					}
				});
				
				self.$checkoutOrderForm.on( "submit", function() {
					var $form = $( this );
					var valid = self._validateForm( $form );
					
					if( !valid ) {
						return valid;
					} else {
						self._saveFormData( $form );
					}
				});
			}
		},
		
		// Private methods
		
		
		// Empties the session storage
		
		_emptyCart: function() {
			this.storage.clear();
		},
		
		/* Format a number by decimal places
		 * @param num Number the number to be formatted
		 * @param places Number the decimal places
		 * @returns n Number the formatted number
		 */
		 
		 
		
		_formatNumber: function( num, places ) {
			var n = num.toFixed( places );
			return n;
		},
		
		/* Extract the numeric portion from a string
		 * @param element Object the jQuery element that contains the relevant string
		 * @returns price String the numeric string
		 */
		
		
		_extractPrice: function( element ) {
			var self = this;
			var text = element.text();
			var price = text.replace( self.currencyString, "" ).replace( " ", "" );
			return price;
		},
		
		/* Converts a numeric string into a number
		 * @param numStr String the numeric string to be converted
		 * @returns num Number the number
		 */
		
		_convertString: function( numStr ) {
			var num;
			if( /^[-+]?[0-9]+\.[0-9]+$/.test( numStr ) ) {
				num = parseFloat( numStr );
			} else if( /^\d+$/.test( numStr ) ) {
				num = parseInt( numStr, 10 );
			} else {
				num = Number( numStr );
			}
			
			if( !isNaN( num ) ) {
				return num;
			} else {
				console.warn( numStr + " cannot be converted into a number" );
				return false;
			}
		},
		
		/* Converts a number to a string
		 * @param n Number the number to be converted
		 * @returns str String the string returned
		 */
		
		_convertNumber: function( n ) {
			var str = n.toString();
			return str;
		},
		
		/* Converts a JSON string to a JavaScript object
		 * @param str String the JSON string
		 * @returns obj Object the JavaScript object
		 */
		
		_toJSONObject: function( str ) {
			var obj = JSON.parse( str );
			return obj;
		},
		
		/* Converts a JavaScript object to a JSON string
		 * @param obj Object the JavaScript object
		 * @returns str String the JSON string
		 */
		
		
		_toJSONString: function( obj ) {
			var str = JSON.stringify( obj );
			return str;
		},
		
		
		/* Add an object to the cart as a JSON string
		 * @param values Object the object to be added to the cart
		 * @returns void
		 */
		
		
		_addToCart: function( values ) {
			var cart = this.storage.getItem( this.cartName );
			
			var cartObject = this._toJSONObject( cart );
			var cartCopy = cartObject;
			var items = cartCopy.items;
			items.push( values );
			
			this.storage.setItem( this.cartName, this._toJSONString( cartCopy ) );
		},	
		
	};
	$(function() {
		var shop = new $.Shop( "#site" );
	});

})( jQuery );