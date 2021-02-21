import React from 'react';

const useStableFunc = (func) => {
  const funcRef = React.useRef();
  funcRef.current = func;

  const containerRef = React.useRef();
  if (!containerRef.current) {
    containerRef.current = (...args) => funcRef.current(...args);
  }
  return containerRef.current;
}

export default useStableFunc;