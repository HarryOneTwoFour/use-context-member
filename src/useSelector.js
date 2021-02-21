import React from 'react';
import { getMember } from './operateMember';

const useSelector = (customContext, selector) => {
  const contextValue = React.useContext(customContext.reactContext);
  const [member, setMember] = React.useState(
    () => contextValue ? getMember(contextValue.state, selector) : customContext.valueWhenOutOfScope);
  const valueRef = React.useRef(member);

  const updateMemberIfNeed = React.useCallback(() => {
    if (!contextValue) {
      return;
    }
    const newMemberValue = getMember(contextValue.state, selector);
    if (valueRef.current !== newMemberValue) {
      valueRef.current = newMemberValue;
      setMember(newMemberValue);
    }
  }, [contextValue, selector]);

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
  }, [contextValue, selector, updateMemberIfNeed]);
  return member;
}

export default useSelector;