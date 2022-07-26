import { createContext, Dispatch, ReactNode, SetStateAction, useState } from "react";

interface CountContextInfo {
  countChange: boolean;
  setCountChange: Dispatch<SetStateAction<boolean>>;
}

/**
 * Turns an instance of CountContextInfo into a context
 **/
export const CountContext = createContext<CountContextInfo>({
  countChange: false,
  setCountChange: () => void 0,
});

/**
 * Takes in children as ReactNodes
 * Returns a context provider with a boolean and a function determining if a resource's count has been altered
 **/
export const CountProvider = ({ children }: { children: ReactNode }) => {
  const [countChange, setCountChange] = useState(false);
  return (
    <CountContext.Provider value={{ countChange, setCountChange }}>
      {children}
    </CountContext.Provider>
  );
};
