export const logError = message => {
  // eslint-disable-next-line no-undef
  if (process.env.NODE_ENV !== 'production') {
    console.error(message);
  }
}

const isObject = (obj) => {
  return Object.prototype.toString.call(obj) === '[object Object]';
}

const copy = (state) => {
  return isObject(state) ? { ...state } : [...state];
}

const calcKey = (state, chain, expression) => {
  if (chain[0] === '[') {
    chain = chain.substring(1, chain.length - 1);
  }
  if (isObject(state)) {
    return chain;
  }

  const index = chain.indexOf('==');
  if (index !== -1) {
    if (index === 0) {
      logError(`expression syntax error: ${expression} > ${chain}. Condition key can't be empty`);
      return undefined;
    }
    const conditionKey = chain.slice(0, index);
    const conditonValue = chain.slice(index + 2);
    const length = state.length;
    for (let i = 0; i < length; i = i + 1) {
      if (state[i][conditionKey] == conditonValue) {
        return i;
      }
    }
    return undefined;
  }

  let number = Number(chain);
  if (isNaN(number)) {
    logError(`expression syntax error: ${expression} > ${chain}. To select from an array, integer or condition are required, but found string`);
    return undefined;
  }
  if (number < 0) {
    number += state.length;
  }
  if (number < 0) {
    return undefined;
  }
  return number;
}

const getChains = (expression) => {
  if (!expression) {
    return [];
  }
  const result = [];
  const expLength = expression.length;
  let current = '';
  let hasLeftBracket = false;
  for (let i = expression[0] === '.' ? 1 : 0; i < expLength; ++i) {
    const c = expression[i];
    if (c === '.' || c === '[') {
      if (hasLeftBracket) {
        current += c;
        continue;
      }
      if (current === '') {
        logError(`expression syntax error: ${expression}`);
        return undefined;
      }
      if (current) {
        result.push(current);
      }
      if (c === '[') {
        current = '[';
        hasLeftBracket = true;
      } else {
        current = '';
      }
    } else if (c === ']') {
      if (!hasLeftBracket) {
        current += c;
        continue;
      }
      current += c;
      hasLeftBracket = false;
    } else {
      current += c;
    }
  }
  if (current === '' || hasLeftBracket) {
    logError(`expression syntax error: ${expression}`);
    return undefined;
  }
  result.push(current);
  return result;
}

export const getMember = (state, expression) => {
  if (typeof expression === 'function') {
    try {
      return expression(state);
    } catch (err) {
      return undefined;
    }
  }
  const chains = getChains(expression);
  if (!chains) {
    return undefined;
  }
  const chainLength = chains.length;
  if (chainLength === 0) {
    return state;
  }
  let s = state;
  for (let i = 0; i < chainLength; i = i + 1) {
    if (s === undefined || s === null) {
      return undefined;
    }
    if (isObject(s) || Array.isArray(s)) {
      const key = calcKey(s, chains[i], expression);
      if (key === undefined) {
        return undefined;
      }
      s = s[key];
    } else {
      logError('You can only select member from object or array');
      return undefined;
    }
  }
  return s;
}

export const updateMember = (state, setState, expression, newMember) => {

  if (typeof newMember === 'function') {
    let oldValue = getMember(state, expression);
    try {
      newMember = newMember(oldValue);
    } catch (error) {
      console.error(error);
      return;
    }
  }

  const chains = getChains(expression);
  if (!chains) {
    return;
  }
  const chainLength = chains.length;
  if (chainLength === 0) {
    setState(newMember);
    return;
  }

  let prevState = state;
  const prevStates = [];
  const keys = [];
  let i;
  for (i = 0; i < chainLength; ++i) {
    const chain = chains[i];
    let key;
    if (prevState === undefined || prevState === null) {
      return;
    } else if (isObject(prevState) || Array.isArray(prevState)) {
      key = calcKey(prevState, chain, expression);
      if (key === undefined) {
        return;
      }
    } else {
      logError('You can only select member from object or array');
      return;
    }
    prevStates.push(prevState);
    keys.push(key);
    prevState = prevState[key];
  }

  let currentState = newMember;
  for (i = chainLength - 1; i >= 0; --i) {
    prevState = copy(prevStates[i]);
    prevState[keys[i]] = currentState;
    currentState = prevState;
  }
  setState(currentState);
}

export const deleteMember = (state, setState, expression) => {
  if (typeof expression === 'function') {
    logError('You are using function to select member, in this case, no member deleter is provided.');
    return;
  }
  const chains = getChains(expression);
  if (!chains) {
    return;
  }
  const chainLength = chains.length;
  if (chainLength === 0) {
    logError('You can only delete a member in an array');
    return;
  }

  let prevState = state;
  const prevStates = [];
  const keys = [];
  let i;
  for (i = 0; i < chainLength; ++i) {
    const chain = chains[i];
    let key;
    if (prevState === undefined || prevState === null) {
      return;
    } else if (isObject(prevState) || Array.isArray(prevState)) {
      key = calcKey(prevState, chain, expression);
      if (key === undefined) {
        return;
      }
    } else {
      logError('You can only select member from object or array');
      return;
    }
    prevStates.push(prevState);
    keys.push(key);
    prevState = prevState[key];
  }


  let currentState = prevStates[chainLength - 1];
  if (!Array.isArray(currentState)) {
    logError('You can only delete a member in an array');
    return;
  }
  currentState = currentState.filter((s, index) => index !== keys[chainLength - 1]);
  for (i = chainLength - 2; i >= 0; --i) {
    prevState = copy(prevStates[i]);
    prevState[keys[i]] = currentState;
    currentState = prevState;
  }
  setState(currentState);
}