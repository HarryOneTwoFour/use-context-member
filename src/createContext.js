import React from 'react';

const createProvider = (reactContext) => {
    const contextValue = {
        listeners: new Set(),
        state: undefined,
        setState: undefined,
    }


    const CustomProvider = (props) => {
        const { value, onChange, children } = props;
        const [innerValue, setInnerValue] = React.useState(value);
        contextValue.state = innerValue;
        contextValue.setState = setInnerValue;

        React.useEffect(() => {
            setInnerValue(value);
        }, [value]);

        React.useEffect(() => {
            onChange && onChange(innerValue);
        }, [innerValue, onChange]);

        React.useEffect(() => {
            contextValue.listeners.forEach(listener => listener());
        }, [innerValue]);

        return (
            <reactContext.Provider value={contextValue}>
                {children}
            </reactContext.Provider>
        )
    }
    return CustomProvider;
}

const createContext = (valueWhenOutOfScope) => {
    const reactContext = React.createContext();
    const customContext = { valueWhenOutOfScope, reactContext };
    customContext.Provider = createProvider(reactContext);
    return customContext;
}

export default createContext;