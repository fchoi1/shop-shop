import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useQuery } from '@apollo/client';

import { QUERY_PRODUCTS } from '../utils/queries';
import spinner from '../assets/spinner.gif';

import { useStoreContext } from '../utils/GlobalState';
import {
  UPDATE_PRODUCTS,
  REMOVE_FROM_CART,
  UPDATE_CART_QUANTITY,
  ADD_TO_CART
} from '../utils/actions';

import { idbPromise } from '../utils/helpers';

import Cart from '../components/Cart';

function Detail() {
  const [state, dispatch] = useStoreContext();

  const { id } = useParams();

  const [currentProduct, setCurrentProduct] = useState({});

  const { loading, data } = useQuery(QUERY_PRODUCTS);

  const { products, cart } = state;

  const addToCart = () => {
    const itemInCart = cart.find((cartItem) => cartItem._id === id);

    if (itemInCart) {
      dispatch({
        type: UPDATE_CART_QUANTITY,
        _id: id,
        purchaseQuantity: parseInt(itemInCart.purchaseQuantity) + 1
      });
      // add indexed db
      idbPromise('cart', 'put', {
        ...itemInCart,
        purchaseQuantity: parseInt(itemInCart.purchaseQuantity) + 1
      });
    } else {
      dispatch({
        type: ADD_TO_CART,
        product: { ...currentProduct, purchaseQuantity: 1 }
      });
      // if item isn't in cart
      idbPromise('cart', 'put', {
        ...currentProduct,
        purchaseQuantity: 1
      });
    }
  };

  const removeFromCart = () => {
    dispatch({ type: REMOVE_FROM_CART, _id: currentProduct._id });
    idbPromise('cart', 'delete', { ...currentProduct });
  };

  useEffect(() => {
    //if products exist find the id, already in store
    if (products.length) {
      setCurrentProduct(products.find((product) => product._id === id));
    } else if (data) {
      // update product list from query
      dispatch({
        type: UPDATE_PRODUCTS,
        products: data.products
      });
      // add to local store
      data.products.forEach((product) => {
        idbPromise('products', 'put', product);
      });
    } else if (!loading) {
      // get from idb if offline
      idbPromise('products', 'get').then((indexedProducts) => {
        dispatch({ type: UPDATE_PRODUCTS, products: indexedProducts });
      });
    }
  }, [products, id, loading, data, dispatch]);

  return (
    <>
      {currentProduct ? (
        <div className="container my-1">
          <Link to="/">← Back to Products</Link>

          <h2>{currentProduct.name}</h2>

          <p>{currentProduct.description}</p>

          <p>
            <strong>Price:</strong>${currentProduct.price}{' '}
            <button onClick={addToCart}>Add to Cart</button>
            <button
              disabled={!cart.find((p) => p._id === currentProduct._id)}
              onClick={removeFromCart}
            >
              Remove from Cart
            </button>
          </p>

          <img
            src={`/images/${currentProduct.image}`}
            alt={currentProduct.name}
          />
        </div>
      ) : null}
      {loading ? <img src={spinner} alt="loading" /> : null}
      <Cart />
    </>
  );
}

export default Detail;
