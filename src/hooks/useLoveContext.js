import { useContext } from 'react';
import { LoveContext } from '../context/context';

export function useLoveContext() {
    const context = useContext(LoveContext);
    if (!context) {
        throw new Error('useLoveContext must be used within LoveProvider');
    }
    return context;
}
