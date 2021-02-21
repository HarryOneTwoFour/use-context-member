import React from 'react';
import { getMember, updateMember, deleteMember, logError } from './operateMember';
import useStableFunc from './useStableFunc';

const useMember = (customContext, memberExpression) => {
  const contextValue = React.useContext(customContext.reactContext);
  const [member, setMember] = React.useState(
    () => contextValue ? getMember(contextValue.state, memberExpression) : customContext.valueWhenOutOfScope);
  const valueRef = React.useRef(member);

  const setter = useStableFunc((newValue) => {
    if (!contextValue) {
      logError('This hook is out of context scope, can not update a member');
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

  const updateMemberIfNeed = React.useCallback(() => {
    if (!contextValue) {
      return;
    }
    const newMemberValue = getMember(contextValue.state, memberExpression);
    if (valueRef.current !== newMemberValue) {
      valueRef.current = newMemberValue;
      setMember(newMemberValue);
    }
  }, [contextValue, memberExpression]);

  React.useEffect(() => {
    if (!contextValue) {
      return;
    }
    updateMemberIfNeed();
    let unmounted = false;
    const handleChange = () => {
      if (unmounted) {
        return;
      }
      updateMemberIfNeed();
    }
    contextValue.listeners.add(handleChange);
    return () => {
      unmounted = true;
      contextValue.listeners.delete(handleChange);
    }
  }, [contextValue, memberExpression, updateMemberIfNeed]);

  return [member, setter, deleter];
}

export default useMember;