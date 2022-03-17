import React, { useEffect } from 'react';
import { useQuery } from '@apollo/client';

import ProductItem from '../ProductItem';
import { QUERY_PRODUCTS } from '../../utils/queries';
import spinner from '../../assets/spinner.gif';

import { useStoreContext } from '../../utils/GlobalState';
import { UPDATE_PRODUCTS } from '../../utils/actions';
import { idbPromise } from '../../utils/helpers';

function ProductList() {
  //get state
  const [state, dispatch] = useStoreContext();
  const { currentCategory } = state;
  const { loading, data } = useQuery(QUERY_PRODUCTS);

  // update state while waiting for query
  useEffect(() => {
    if (data) {
      // update store global
      dispatch({ type: UPDATE_PRODUCTS, products: data.products });
      // update idb stores
      data.products.forEach((product) => {
        idbPromise('products', 'put', product);
      });

      // add else if to check if `loading` is undefined in `useQuery()` Hook
    } else if (!loading) {
      // get data from idb store if offline and add to global
      idbPromise('products', 'get').then((products) => {
        dispatch({ type: UPDATE_PRODUCTS, products: products });
      });
    }
  }, [data, loading, dispatch]);

  function filterProducts() {
    if (!currentCategory) {
      return state.products;
    }

    return state.products.filter(
      (product) => product.category._id === currentCategory
    );
  }

  return (
    <div className="my-2">
      <h2>Our Products:</h2>
      {state.products.length ? (
        <div className="flex-row">
          {filterProducts().map((product) => (
            <ProductItem
              key={product._id}
              _id={product._id}
              image={product.image}
              name={product.name}
              price={product.price}
              quantity={product.quantity}
            />
          ))}
        </div>
      ) : (
        <h3>You haven't added any products yet!</h3>
      )}
      {loading ? <img src={spinner} alt="loading" /> : null}
    </div>
  );
}

export default ProductList;
