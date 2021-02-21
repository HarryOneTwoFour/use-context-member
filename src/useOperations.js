import React from 'react';
import { updateMember, deleteMember, logError } from './operateMember';
import useStableFunc from './useStableFunc';

const useOperations = (customContext, memberExpression) => {
  const contextValue = React.useContext(customContext.reactContext);

  const setter = useStableFunc((newValue) => {
    if (!contextValue) {
      logError('This hook is out of context scope, can not do update');
      return;
    }
    const { state, setState } = contextValue;
    updateMember(state, setState, memberExpression, newValue);
  });

  const deleter = useStableFunc(() => {
    if (!contextValue) {
      logError('This hook is out of context scope, can not do delete');
      return;
    }
    const { state, setState } = contextValue;
    deleteMember(state, setState, memberExpression);
  })

  return [setter, deleter];
}

export default useOperations;