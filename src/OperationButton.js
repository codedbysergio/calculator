import { useEffect } from 'react';
import { ACTIONS } from './App'

export default function OperationButton({ dispatch, operation, id, pressedKey }) {

    function handleKeyDown(event) {
        if (event.key === pressedKey) {
            document.getElementById(id).focus();
            dispatch({ type: ACTIONS.CHOOSE_OPERATION, payload: { operation }})
            setTimeout(() => {
                document.getElementById(id).blur()}, 100);
        }
    }

    useEffect(() => {
        window.addEventListener('keydown', handleKeyDown);
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    });

    return (
        <button 
            id={id}
            onClick={() => dispatch({ type: ACTIONS.CHOOSE_OPERATION, payload: { operation }})}
        >
            { operation }
        </button>
    )
}