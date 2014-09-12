// autentication http://www.sitepoint.com/implementing-authentication-angular-applications/

var g_backToTop     = document.getElementById('backToTop');
var g_mainSection   = document.getElementById('mainSection');
var g_cartContainer = document.getElementById('cartContainer');
var g_priceBook     = document.getElementById('priceBook');
var g_cartID        = [];

var app = angular.module('searchProduct', []);

function searchProductController($scope, $http, $location, $anchorScroll)
{
    $scope.goToProductID = function(goToID)
    {
        $location.hash(goToID);
        $anchorScroll();
    }
    /*--- scroll to the place of the ID --*/

    $scope.goBackToTop = function()
    {
        g_mainSection.scrollTop   = 0;
    }
    /*--- scroll to the top --*/

    $scope.products = [];

    $http.get('products.json').success(function(retrievedData) {
        //console.log(retrievedData.products);
        $scope.products = retrievedData.products;
    }).error(function(error){
        console.log(error);
    });
    /*--- retrieve the json via Ajax --*/

    //console.log($scope.products);


    $scope.addToCart = function(productID)
    {
        for(var p in $scope.products)
        {
            if(productID === $scope.products[p].id)
            {
                //console.log($scope.products[p].id);
                var products    = $scope.products[p];
                
                g_cartID.push(products.id);
                
                console.log('addToCart cartid ');
                console.log(g_cartID);
                
                cartController();

                break;
            }
        }
        var cartDOM    = document.getElementById('showCartButton');
        if(cartDOM.className !== 'addAnimationToCart')
        {
            cartDOM.className += 'addAnimationToCart';
        }
        
        setTimeout(function() {
            cartDOM.className = '';
        }, 2000);
        
    }
    /*--- addToCart fills the g-cart var  ---*/

    function cartController()
    {
        //console.log(g_cartID)
        var itemID      = [];
        var itemName    = [];
        var itemPrice   = [];
        var chartLen    = g_cartID.length;
        var sumPrice    = 0;
        var chartCounter= 0;

        for(var i = 0 ; i < chartLen ; i++)
        {
            for(var p in $scope.products)
            {
                var products    = $scope.products[p];
                if(g_cartID[i] === products.id)
                {
                    var newIdBasedOnCounter = chartCounter;

                    var name    = products.name;
                    var price   = parseInt(products.price);

                    itemID.push(newIdBasedOnCounter);
                    itemName.push(name);
                    itemPrice.push(price);
                    sumPrice += price;

                    break;
                }    
            }
            chartCounter++;
        }

        cartView(itemID, itemName, itemPrice, sumPrice);
    }
    /*--- cartController makes the data for the cartView ---*/

    function cartView(itemID, itemName, itemPrice, sumPrice)
    {     
        refreshCartViewHtml(itemID, itemName, itemPrice, sumPrice);
        refreshCartEventListener(itemID, itemName, itemPrice, sumPrice);
    }
    /*--- create the cartView html ---*/

    
    function refreshCartViewHtml(itemID, itemName, itemPrice, sumPrice)
    {
        var cartViewStr = '';
        var itemNameLen = itemName.length;

        cartViewStr += '<h2 id="productsInCart">Products in cart</h2>';

        cartViewStr += '<ul>';

        //var counter = 0;
        for(var index in itemName)
        {
            var id      = index;
            var name    = itemName[index];
            var price   = itemPrice[index];
            
            cartViewStr += '<li>';
                cartViewStr += '<p class="productName">' + name + ' - ' + price + '</p>';
                cartViewStr += '<img class="item" id="item' + id + '" src="./img/delete2.png" alt="delete" title="delete from cart"/>';
            cartViewStr += '</li>';
            
            //counter++;
        }
        
        cartViewStr += '</ul>';

        cartViewStr += '<p id="sumPrice">';
        cartViewStr += 'The price is ' + sumPrice;
        cartViewStr += '</p>';

        var cartInner = document.getElementById('cartInner');
        cartInner.innerHTML = cartViewStr;  
    }
    /*--- create and recreate the view of the cart ---*/
    
    function refreshCartEventListener(itemID, itemName, itemPrice, sumPrice)
    {
        var items       = document.querySelectorAll('.item');
        var itemsLen    = items.length;

        for(var i = 0 ; i < itemsLen ; i++)
        {
            var id  = itemID[i];

            items[i].addEventListener('click', function() {
                this.parentNode.remove(this);
                var classStr        = this.id;  // for instace: 'item0'
                var classStrCuttedID  = parseInt(classStr.substring(4, classStr.length)); // for instace: '0'
                
                
                delete itemID[classStrCuttedID];
                delete itemName[classStrCuttedID];
                delete itemPrice[classStrCuttedID];

                itemID      = normalizeArray(itemID);
                itemName    = normalizeArray(itemName);
                itemPrice   = normalizeArray(itemPrice);
                
                refreshCartViewHtml(itemID, itemName, itemPrice, sumPrice);
                refreshCartEventListener(itemID, itemName, itemPrice, sumPrice);
                
                
                if (classStrCuttedID > -1) {
                    
                    if(g_cartID.length > 1)
                        g_cartID.splice(classStrCuttedID, 1);
                    else
                        g_cartID.length = 0;
                        
                    console.log('from ' + classStrCuttedID);
                    console.log('to ' + 1);
                    
                }   // the index has to be deleted also from the global array

                console.log('delete cartID after');
                console.log(g_cartID);
                
                g_cartID   = normalizeArray(g_cartID);
                
                console.log('normalized cart')
                console.log(g_cartID)
                
                sumNewPrice = 0;
                for(IP in itemPrice)
                {
                    sumNewPrice += parseInt(itemPrice[IP]);
                }

                modifySumPriceHTML(sumNewPrice);

            }, false);
            // delete eventListener  
        }    
    }
    /*--- refreshCart event listener ---*/
    
    
    function normalizeArray(nestedArray)
    {
        var arrayHelper = [];
        //var counter = 0;
        for(id in nestedArray)
        {
            //nestedArray[counter] = parseInt(nestedArray[id]);
            //counter++;
            arrayHelper.push(nestedArray[id]);
        }
        
        return arrayHelper;
    }
    /*--- normalize nested arrays ---*/
    
    function modifySumPriceHTML(sumNewPrice)
    {
        var el          = document.getElementById('sumPrice');

        if(sumNewPrice <= 0)
            el.innerHTML    = 'There is no product in your basket';
        else
            el.innerHTML    = 'The price is ' + sumNewPrice;    
    }
    /*--- changing the HTML of the sumPrice ---*/
    
    
    $scope.showCart = function()
    {
        g_cartContainer.style.display = 'block';
        g_priceBook.style.display     = 'none';
    }
    
    $scope.showPriceBook = function()
    {
        g_cartContainer.style.display = 'none';
        g_priceBook.style.display     = 'block';
    }
}

setContentHeight();

function setContentHeight()
{
    g_mainSection.style.height = window.innerHeight + 'px';
}
/*--- set the Height of the #mainSection --*/

g_mainSection.onscroll = function()
{
    var mainSectionScrollTop    = g_mainSection.scrollTop;

    if(mainSectionScrollTop > 190)
        g_backToTop.style.display = 'block';
    else
        g_backToTop.style.display = 'none';   
}
/*--- scroll event for 'backToTop container --*/