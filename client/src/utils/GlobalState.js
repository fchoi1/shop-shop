import React, { createContext, useContext } from 'react';
import { useProductReducer } from './reducers';

//instatiate global state object empty
const StoreContext = createContext();
const { Provider } = StoreContext;

const StoreProvider = ({ value = [], ...props }) => {
  // state is most up to date flobal state
  // dispatch is the method to execut to update state
  const [state, dispatch] = useProductReducer({
    products: [],
    categories: [],
    currentCategory: ''
  });

  console.log(state);

  return <Provider value={[state, dispatch]} {...props} />;
};

const useStoreContext = () => {
  return useContext(StoreContext);
};

export { StoreProvider, useStoreContext };
