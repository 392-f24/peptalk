import React, {useContext} from 'react';

const pepContext = React.createContext()

export function usePepContext () {
    return useContext(pepContext);
}

export function pepProvider({children}) {
    return (
        <pepContext.Provider value={{}}>
            {children}
        </pepContext.Provider>
    )

}