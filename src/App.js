import { useReducer, useEffect } from 'react'
import DigitButton from './DigitButton'
import OperationButton from './OperationButton'
import './styles.css'

export const ACTIONS = {
  ADD_DIGIT: 'add-digit',
  CHOOSE_OPERATION: 'choose-operation',
  CLEAR: 'clear',
  DELETE_DIGIT: 'delete-digit',
  EVALUATE: 'evaluate'
}


const [ADD, SUBTRACT, MULTIPLY, DIVIDE] = ['+', '-', '×', '÷'];

function alreadyHasDecimal(operand) {
  return (operand.includes(".") && operand.length > 1)
}

function negativeSignNotSubtration(operand, previousOperand) {
  return (operand === "-" &&
      (( previousOperand === ADD || previousOperand === DIVIDE) || 
      previousOperand === MULTIPLY))
}

function nextNumberAfterOperand(operand) {
  return ((operand === ADD || operand === SUBTRACT) || 
  (operand === DIVIDE || operand === MULTIPLY))
}

function lastCharIsNotAnOperator(equation) {
  let len = equation.length
  let lastChar = equation.substring(len-1, len);
  while (( lastChar === ADD || lastChar === SUBTRACT ) || 
  ( lastChar === MULTIPLY || lastChar === DIVIDE )) {
    equation = equation.substring(0, len - 1)
    len = equation.length
    lastChar = equation.substring(len-1, len)
  }
  
  return equation;
}

function findNextOperator(equation) {
  const nextOpArray = []
  if (equation.indexOf(ADD) > -1) {
    nextOpArray.push(equation.indexOf(ADD))
  }
  if (equation.indexOf(SUBTRACT) > -1) {
    nextOpArray.push(equation.indexOf(SUBTRACT))
  }
  if (equation.indexOf(MULTIPLY) > -1) {
    nextOpArray.push(equation.indexOf(MULTIPLY))
  }
  if (equation.indexOf(DIVIDE) > -1) {
    nextOpArray.push(equation.indexOf(DIVIDE))
  }
  return Math.min(...nextOpArray);
}

function putEquationIntoArray(equation) {
  const eqArray = []
  //in the while-loop, the -1s, +1s, and +2s ensure it doesn't treat the negative-sign as subtraction on negative numbers
  //once the function finds the next operator, it ignores the following character which can only be a number or a negative sign
  let nextOperator = findNextOperator(equation) - 1
  while (nextOperator !== Infinity) {
    //pushes first number in equation into the equation-array
    eqArray.push(equation.substring(0, nextOperator + 1))
    //pushes operator that immediately follows first number into equation-array
    eqArray.push(equation.substring(nextOperator + 1, nextOperator + 2))
    //removes the number and operator (that were just pushed) from the equation-string
    equation = equation.substring(nextOperator + 2, equation.length)
    //looks for next operator FOLLOWING the first character, which can only be a digit or a negative sign
    nextOperator = findNextOperator(equation.substring(1, equation.length))
  }
  //now that all of the equation, up to the last operator and every number before that, has been removed, only the last number exists. push that into the equation-array
  eqArray.push(equation)

  return eqArray
  
}

function executeCalculation(array, operation) {
  
  const operatorLocation = array.indexOf(operation);
  let solution;
  
  switch (operation) {
    case MULTIPLY:
      solution = Number(array[operatorLocation-1]) * Number(array[operatorLocation+1]);
      break;
    case DIVIDE:
      solution = Number(array[operatorLocation-1]) / Number(array[operatorLocation+1]);
      break;
    case ADD:
      solution = Number(array[operatorLocation-1]) + Number(array[operatorLocation+1]);
      break;
    case SUBTRACT:
      solution = Number(array[operatorLocation-1]) - Number(array[operatorLocation+1]);
      break;
    default: return;
  }

  array[operatorLocation-1] = null
  array[operatorLocation] = solution.toString()
  array[operatorLocation+1] = null
  
  const newArray = [];

  for (let i = 0; i < array.length; i++) {
    if (array[i] !== null) {
      newArray.push(array[i])
    }
  }

  return newArray;

}

function performCalculations(eqArray, operation1, operation2) {
  //operation1 is multiply or add, operation2 is divide or multiply, respectively
  while (eqArray.includes(operation1) || eqArray.includes(operation2)) {
    if (!eqArray.includes(operation2)) {
      eqArray = executeCalculation(eqArray, operation1)
    }
    else if (!eqArray.includes(operation1)) {
      eqArray = executeCalculation(eqArray, operation2)
    }
    else {
      eqArray.indexOf(operation1) < eqArray.indexOf(operation2) ? eqArray =  executeCalculation(eqArray, operation1) : eqArray = executeCalculation(eqArray, operation2)
    }
  }
  return eqArray
}

function hasNoOperators(equation) {
  return (( !equation.includes(ADD) && !equation.includes(SUBTRACT) ) && 
  (!equation.includes(MULTIPLY) && !equation.includes(DIVIDE) ))
}

function evaluate(fEquation) {
  if (hasNoOperators(fEquation)) {
    return fEquation
  }

  let equationArray = putEquationIntoArray(fEquation)
  
  equationArray = performCalculations(equationArray, MULTIPLY, DIVIDE)
 
  equationArray = performCalculations(equationArray, ADD, SUBTRACT)

  return equationArray
}


function reducer(state, {type, payload}) {
  const eqLength = state.fullEquation.length;
  const eqLastChar = state.fullEquation.substring(eqLength-1, eqLength);
  const eqSecondToLastChar = state.fullEquation.substring(eqLength-2, eqLength-1);


  switch (type) {

    case ACTIONS.ADD_DIGIT:

      if (state.overwrite) {
        return {
          ...state,
          currentOperand: payload.digit,
          fullEquation: payload.digit,
          overwrite: false,
        }
      }

      if (state.currentOperand === "0" && payload.digit === '.') {
        return {
          ...state,
          fullEquation: `0${payload.digit}`,
          currentOperand: `0${payload.digit}`,
        }
      }
  
      if (state.currentOperand === "0") {
        return {
          ...state,
          fullEquation: `${payload.digit}`,
          currentOperand: payload.digit,
        }
      }
  

      if (payload.digit === "." && alreadyHasDecimal(state.currentOperand)) {
        return state
      }

      if (negativeSignNotSubtration(state.currentOperand, eqSecondToLastChar)) {
        return {
          ...state,
          fullEquation: `${state.fullEquation}${payload.digit}`,
          currentOperand: `${state.currentOperand}${payload.digit}`,
        }
      }


      if (nextNumberAfterOperand(state.currentOperand)) {
        return {
          ...state,
          fullEquation: `${state.fullEquation}${payload.digit}`,
          currentOperand: payload.digit,
        }
      }

      return {
        ...state,
        currentOperand: `${state.currentOperand || ""}${payload.digit}`,
        fullEquation: `${state.fullEquation}${payload.digit}`,
      }

    
    case ACTIONS.CHOOSE_OPERATION:
      if (state.overwrite) {
        return {
          ...state,
          currentOperand: payload.operation,
          fullEquation: `${state.currentOperand}${payload.operation}`,
          overwrite: false,
        }
      }
      // if you're attempting to do an operation on a negative number BUT THEN hit an operator, it removes the last two operators and replaces them with the operator just selected
      if (((eqLastChar  === ADD || eqLastChar  === SUBTRACT ) ||
        (eqLastChar  === MULTIPLY || eqLastChar  === DIVIDE )) &&
        ((eqSecondToLastChar  === ADD || eqSecondToLastChar  === SUBTRACT ) ||
        (eqSecondToLastChar  === MULTIPLY || eqSecondToLastChar  === DIVIDE ))) {
          return {
            ...state,
            currentOperand: payload.operation,
            fullEquation: `${state.fullEquation.substring(0, [eqLength - 2])}${payload.operation}`,
          }
        }

      if (state.fullEquation === "") {
        return {
          ...state,
          fullEquation: `0${payload.operation}`,
          currentOperand: payload.operation,
        }
      }

      if (payload.operation === "-" && 
      ((eqLastChar === "+" || eqLastChar === "÷") || eqLastChar === "×")) {
        return {
          ...state,
          fullEquation: `${state.fullEquation}${payload.operation}`,
          currentOperand: payload.operation,
        }
      }

      if (payload.operation === "-" && eqLastChar === "-") {
        return state
      }

      if ((payload.operation === "+" || 
      ( payload.operation === "÷" || payload.operation === "×")) && 
      (( eqLastChar === "+" || eqLastChar === "-" ) || 
      ( eqLastChar === "×" || eqLastChar === "÷" ))) {
        return {
          ...state,
          fullEquation: `${state.fullEquation.substring(0, eqLength -1)}${payload.operation}`,
          currentOperand: payload.operation,
        }
      }

      return {
        ...state,
        fullEquation: `${state.fullEquation}${payload.operation}`,
        currentOperand: payload.operation,
      }
    
    case ACTIONS.CLEAR:
        return { 
          ...state,
          fullEquation: "",
          currentOperand: "0",
          overwrite: false,
        }

    
    case ACTIONS.EVALUATE:
      //return the current state if the currentOperand is null, or the fullEquation is null, or if the full equation doesn't have any operators
      if (( state.currentOperand == null || state.fullEquation == null ) ||
        (state.fullEquation.includes("=") || (state.currentOperand === "0" && state.fullEquation === "") )) {
        return state
      }

      const feq = lastCharIsNotAnOperator(state.fullEquation)
      const calculation = evaluate(feq)
      return {
        ...state,
        overwrite: true,
        fullEquation: `${feq}=${calculation}`,
        currentOperand: calculation,
      }

      default: return;
  }
}


function App() {

  const [{ currentOperand, fullEquation, overwrite }, dispatch] = useReducer(reducer, {currentOperand: "0", fullEquation: "", overwrite: false})


  //Event Listeners for ENTER key and ESCAPE key (equals and all-clear)
  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => {
        window.removeEventListener('keydown', handleKeyDown);
    };
  });

  
  function handleKeyDown(event) {
    //overwrite is used here as a workaround for a 'declared but never used' error since it is only used in this file outside the component
    if (event.key === 'Enter' && (overwrite || !overwrite)) {
        document.getElementById('equals').focus();
        dispatch({ type: ACTIONS.EVALUATE })
        setTimeout(() => {
            document.getElementById('equals').blur()}, 100);
    }

    else if (event.key === "Escape") {
      document.getElementById('clear').focus();
        dispatch({ type: ACTIONS.CLEAR })
        setTimeout(() => {
            document.getElementById('clear').blur()}, 100);
    }

    return;
  }

  
  return (
    <div className="calculator-grid">
      <div className="output">
        <div className="previous-operand">{fullEquation}</div>
        <div className="current-operand" id="display">{currentOperand}</div>
      </div>
      <button 
        className="span-two" 
        id="clear" 
        onClick={() => dispatch({ type: ACTIONS.CLEAR })}
      >AC</button>
      <OperationButton operation="÷" pressedKey="/" id="divide" dispatch={dispatch}/>
      <OperationButton operation="×" pressedKey="*" id="multiply" dispatch={dispatch}/>
      <DigitButton digit="1" id="one" dispatch={dispatch}/>
      <DigitButton digit="2" id="two" dispatch={dispatch}/>
      <DigitButton digit="3" id="three" dispatch={dispatch}/>
      <OperationButton operation="+" pressedKey="+" id="add" dispatch={dispatch}/>
      <DigitButton digit="4" id="four" dispatch={dispatch}/>
      <DigitButton digit="5" id="five" dispatch={dispatch}/>
      <DigitButton digit="6" id="six" dispatch={dispatch}/>
      <OperationButton operation="-" pressedKey="-" id="subtract" dispatch={dispatch}/>
      <DigitButton digit="7" id="seven" dispatch={dispatch}/>
      <DigitButton digit="8" id="eight" dispatch={dispatch}/>
      <DigitButton digit="9" id="nine" dispatch={dispatch}/>
      <button 
        id="equals" 
        className="span-two-vertical"
        onClick={() => dispatch({ type: ACTIONS.EVALUATE })}
      >=</button>
      <DigitButton className="span-two" digit="0" id="zero" dispatch={dispatch}/>
      <DigitButton digit="." id="decimal" dispatch={dispatch}/>
      
    </div>
  );
}

export default App;
