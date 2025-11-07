import { createContext, useContext, ReactNode } from 'react';
import GraphStore from './GraphStore';

const graphStore = new GraphStore();

const StoreContext = createContext<{
  graphStore: GraphStore;
}>({
  graphStore,
});

export const StoreProvider = ({ children }: { children: ReactNode }) => {
  return (
    <StoreContext.Provider value={{ graphStore }}>
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error('useStore must be used within StoreProvider');
  }
  return context;
};

export const useGraphStore = () => {
  const { graphStore } = useStore();
  return graphStore;
};
