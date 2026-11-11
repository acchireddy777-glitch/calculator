const screen = document.getElementById("screen");
const history = document.getElementById("history");

let current = "0";      // the number being typed
let previous = null;    // the first number, saved when an operator is pressed
let operator = null;    // "+", "-", "*" or "/"
let startNewNumber = false;

const symbols = { "+": "+", "-": "\u2212", "*": "\u00d7", "/": "\u00f7" };

function updateScreen() {
  screen.textContent = current;
  history.textContent = operator ? previous + " " + symbols[operator] : "";
}

function inputDigit(digit) {
  if (startNewNumber || current === "0" || current === "Error") {
    current = digit;
    startNewNumber = false;
  } else if (current.length < 15) {
    current += digit;
  }
  updateScreen();
}

function inputDecimal() {
  if (startNewNumber || current === "Error") {
    current = "0.";
    startNewNumber = false;
  } else if (!current.includes(".")) {
    current += ".";
  }
  updateScreen();
}

function calculate(a, b, op) {
  if (op === "+") return a + b;
  if (op === "-") return a - b;
  if (op === "*") return a * b;
  if (op === "/") return b === 0 ? null : a / b;
}

function formatResult(value) {
  if (value === null) return "Error";
  // round to avoid results like 0.1 + 0.2 = 0.30000000000000004
  return String(parseFloat(value.toPrecision(12)));
}

function chooseOperator(nextOperator) {
  if (current === "Error") return;
  if (operator && !startNewNumber) {
    // chain: 2 + 3 + ... works out 2 + 3 first
    current = formatResult(calculate(parseFloat(previous), parseFloat(current), operator));
    if (current === "Error") { operator = null; previous = null; updateScreen(); return; }
  }
  previous = current;
  operator = nextOperator;
  startNewNumber = true;
  updateScreen();
}

function equals() {
  if (!operator || current === "Error") return;
  const result = formatResult(calculate(parseFloat(previous), parseFloat(current), operator));
  history.textContent = previous + " " + symbols[operator] + " " + current + " =";
  current = result;
  previous = null;
  operator = null;
  startNewNumber = true;
  screen.textContent = current;
}

function clearAll() {
  current = "0";
  previous = null;
  operator = null;
  startNewNumber = false;
  updateScreen();
}

function deleteLast() {
  if (startNewNumber || current === "Error") return;
  current = current.length > 1 ? current.slice(0, -1) : "0";
  updateScreen();
}

function percent() {
  if (current === "Error") return;
  current = formatResult(parseFloat(current) / 100);
  updateScreen();
}

// Button clicks
document.querySelector(".keys").addEventListener("click", (event) => {
  const button = event.target.closest("button");
  if (!button) return;

  if (button.dataset.digit) inputDigit(button.dataset.digit);
  else if (button.dataset.operator) chooseOperator(button.dataset.operator);
  else if (button.dataset.action === "decimal") inputDecimal();
  else if (button.dataset.action === "equals") equals();
  else if (button.dataset.action === "clear") clearAll();
  else if (button.dataset.action === "delete") deleteLast();
  else if (button.dataset.action === "percent") percent();
});

// Keyboard support
document.addEventListener("keydown", (event) => {
  if (event.key >= "0" && event.key <= "9") inputDigit(event.key);
  else if (["+", "-", "*", "/"].includes(event.key)) chooseOperator(event.key);
  else if (event.key === ".") inputDecimal();
  else if (event.key === "Enter" || event.key === "=") { event.preventDefault(); equals(); }
  else if (event.key === "Backspace") deleteLast();
  else if (event.key === "Escape") clearAll();
});

updateScreen();
