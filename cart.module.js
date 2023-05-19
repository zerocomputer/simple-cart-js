(() => {
    // Cart
    var cart = [];
    var cartWindow = document.getElementById('cart-window') ?? null;

    // Loading cart from local storage 
    if (localStorage.getItem('cart_data')) {
        try {
            cart = JSON.parse(localStorage.getItem('cart_data'));
        } catch (e) {
            console.log(`Appeared error while parsing cart JSON: ${e}`);
        }
    }

    // Reloading cart window
    const reload = () => {
        if (cartWindow === null)
            return;

        cartWindow.innerHTML = ``;

        for (let product of cart) {
            let productElement = document.createElement('div');
            productElement.innerHTML = `
                <img src="${product.image}" alt="Placeholder image">
                <h1>${product.name}</h1>
                <p>${product.price} x ${product.count}</p>
            `;

            cartWindow.appendChild(productElement);
        }

        for (let amountElement of document.querySelectorAll('[zero-cart-amount]')) {
            amountElement.textContent = getAmount();
        }

        for (let addToCartElement of document.querySelectorAll('.add_to_cart')) {
            if (addToCartElement.getAttribute('listen')) {
                continue;
            }

            addToCartElement.setAttribute('listen', true);

            addToCartElement.addEventListener('click', (e) => {
                add(getRequiredAttrsFromElement(addToCartElement));
            });
        }

        for (let removeFromCartElement of document.querySelectorAll('.remove_from_cart')) {
            if (removeFromCartElement.getAttribute('listen')) {
                continue;
            }

            removeFromCartElement.setAttribute('listen', true);

            removeFromCartElement.addEventListener('click', () => {
                remove(getRequiredAttrsFromElement(removeFromCartElement));
            });
        }
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
    const add = ({id, name, price, image}) => {
        let product = cart.filter((x) => x.id === id || x.name === name);
        
        if (product.length === 0) {
            cart.push({id, name, price, image, count: 1});
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
        reload();
    });
})();