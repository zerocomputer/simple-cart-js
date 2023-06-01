(() => {
    // Cart
    window.cart = [];
    window.cartPayments = [];
    window.cartWindow = document.getElementById('cart-window') ?? null;

    // Loading cart from local storage 
    if (localStorage.getItem('cart_data')) {
        try {
            cart = JSON.parse(localStorage.getItem('cart_data'));
        } catch (e) {
            console.log(`Appeared error while parsing cart JSON: ${e}`);
        }
    }

    // Reload payment buttons
    const reloadPayment = () => {
        let cartIsEmpty = cart.length === 0;

        for (let paymentButton of cartPayments) {
            let hideMethod = paymentButton.getAttribute('zero-cart-hide-if-empty') === "" ? true : false;

            if (hideMethod) {
                if (cartIsEmpty)
                    paymentButton.setAttribute('style', "display: none !important;");
                else
                    paymentButton.removeAttribute('style');
            } else {
                paymentButton.disabled = cartIsEmpty;
            }
        }
    }

    // Reloading cart window
    const reload = () => {
        if (cartWindow === null)
            return;

        cartWindow.innerHTML = ``;

        for (let product of cart) {
            let productElement = document.createElement('div');
            productElement.className = 'border rounded p-4 mb-2 d-flex align-items-center'
            productElement.style.gap = '16px';
            productElement.innerHTML = `
                <img src="${product.image}" alt="Placeholder image">
                <div>
                    <h3>${product.name}</h3>
                    <p>${product.price} x ${product.count}</p>
                </div>
                <button 
                    class="btn btn-danger ms-auto" 
                    zero-do-cart-remove 
                    zero-cart-id="${product.id}" 
                    zero-cart-name="${product.name}">X</button>
            `;

            cartWindow.appendChild(productElement);
        }

        for (let amountElement of document.querySelectorAll('[zero-cart-amount]')) {
            amountElement.textContent = getAmount();
        }

        for (let addToCartElement of document.querySelectorAll('[zero-do-cart-add]')) {
            if (addToCartElement.getAttribute('listen')) {
                continue;
            }

            addToCartElement.setAttribute('listen', true);

            addToCartElement.addEventListener('click', (e) => {
                let additionalStatementResult = true;
                
                if (e.target.getAttribute('zero-cart-additional-statement')) {
                    let additionalStatement = e.target.getAttribute('zero-cart-additional-statement');
                    additionalStatementResult = window[additionalStatement]();
                }

                if (additionalStatementResult)
                    add(getRequiredAttrsFromElement(addToCartElement));
            });
        }

        for (let removeFromCartElement of document.querySelectorAll('[zero-do-cart-remove]')) {
            if (removeFromCartElement.getAttribute('listen')) {
                continue;
            }

            removeFromCartElement.setAttribute('listen', true);

            removeFromCartElement.addEventListener('click', () => {
                remove(getRequiredAttrsFromElement(removeFromCartElement));
            });
        }

        // Reloading payment buttons
        reloadPayment();
    }
    // Saving cart to local storage
    const save = () => {
        reload();

        try {
            localStorage.setItem('cart_data', JSON.stringify(cart));
        } catch (e) {
            console.log(`Appeared error while writing cart JSON: ${e}`);
        }
    }
    // Adding product to cart
    const add = ({id, type, name, price, image}) => {
        let product = cart.filter((x) => x.id === id || x.name === name);
        
        if (product.length === 0) {
            cart.push({id, type, name, price, image, count: 1});
        } else {
            cart[cart.indexOf(product[0])].count++;
        }

        save();
    }
    // Removing product from cart
    const remove = ({id, name}) => {
        let product = cart.filter((x) => x.id === id || x.name === name);

        if (product.length === 0) {
            alert('Продукт уже отсутствует в корзине!');
            return;
        }

        product = product[0];
        
        if (product.count === 1) {
            cart.splice(cart.indexOf(product), 1);
        } else {
            cart[cart.indexOf(product)].count--;
        }

        save();
    }
    // Get required attributes from element
    const getRequiredAttrsFromElement = (element) => {
        return {
            id: element.getAttribute('zero-cart-id'),
            type: element.getAttribute('zero-cart-type'),
            name: element.getAttribute('zero-cart-name'),
            price: element.getAttribute('zero-cart-price'),
            image: element.getAttribute('zero-cart-image'),
        };
    }
    // Get almost amount of all products in cart
    const getAmount = () => {
        let amount = 0;

        for (let product of cart) {
            amount += product.price * product.count;
        }

        return amount;
    }

    // Initialization
    document.addEventListener('DOMContentLoaded', () => {
        // Loading all payments button
        cartPayments = document.querySelectorAll('[zero-do-cart-payment]');

        // Reloading UI
        reload();
    });
})();