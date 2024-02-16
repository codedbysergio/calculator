import { useEffect } from 'react';
import { ACTIONS } from './App'

export default function DigitButton({ dispatch, digit, id, className }) {

    function handleKeyDown(event) {
        if (event.key === digit) {
            document.getElementById(id).focus();
            dispatch({ type: ACTIONS.ADD_DIGIT, payload: { digit }})
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
            className={ className }
            onClick={() => dispatch({ type: ACTIONS.ADD_DIGIT, payload: { digit }})}
        >
            { digit }
        </button>
    )
}