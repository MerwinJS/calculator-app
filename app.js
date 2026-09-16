const display = document.getElementById("display");
const expression = document.getElementById("expression");
const keys = document.querySelector(".keys");

let current = "0";
let stored = null;
let operator = null;
let waitingForOperand = false;
let justCalculated = false;

function formatNumber(value) {
  if (!Number.isFinite(Number(value))) return "Error";
  let n = Number(value);
  if (Math.abs(n) >= 1e12 || (Math.abs(n) > 0 && Math.abs(n) < 1e-9)) {
    return n.toExponential(8).replace(/\.?0+e/, "e");
  }
  return n.toLocaleString("en-US", { maximumFractionDigits: 10, useGrouping: true });
}
function rawNumber(s) { return Number(String(s).replace(/,/g, "")); }
function update() { display.textContent = formatNumber(current); }

function inputDigit(d) {
  if (current === "Error" || waitingForOperand || justCalculated) {
    current = d; waitingForOperand = false; justCalculated = false;
  } else {
    if (current.replace(/-/g,"").replace(".","").length >= 15) return;
    current = current === "0" ? d : current + d;
  }
  update();
}
function decimal() {
  if (current === "Error" || waitingForOperand || justCalculated) {
    current = "0."; waitingForOperand = false; justCalculated = false;
  } else if (!current.includes(".")) current += ".";
  update();
}
function chooseOperator(next) {
  const input = rawNumber(current);
  if (current === "Error") return clearAll();
  if (operator && waitingForOperand) { operator = next; return; }
  if (stored === null) stored = input;
  else if (operator) {
    const result = calculate(stored, input, operator);
    if (result === null) return showError();
    stored = result;
    current = String(result);
    update();
  }
  operator = next;
  waitingForOperand = true;
  justCalculated = false;
  expression.textContent = `${formatNumber(stored)} ${next}`;
}
function calculate(a,b,op) {
  if (op === "+") return a+b;
  if (op === "−") return a-b;
  if (op === "×") return a*b;
  if (op === "÷") return b === 0 ? null : a/b;
}
function equals() {
  if (!operator || stored === null || current === "Error") return;
  const a = stored, b = rawNumber(current), op = operator;
  const result = calculate(a,b,op);
  if (result === null) return showError();
  expression.textContent = `${formatNumber(a)} ${op} ${formatNumber(b)} =`;
  current = String(result);
  stored = null; operator = null;
  waitingForOperand = false; justCalculated = true;
  update();
}
function clearAll() {
  current = "0"; stored = null; operator = null;
  waitingForOperand = false; justCalculated = false;
  expression.textContent = "";
  update();
}
function sign() {
  if (current === "0" || current === "Error") return;
  current = current.startsWith("-") ? current.slice(1) : "-" + current;
  update();
}
function percent() {
  if (current === "Error") return;
  const n = rawNumber(current);
  if (stored !== null && operator && (operator === "+" || operator === "−")) {
    current = String(stored * n / 100);
  } else current = String(n / 100);
  update();
}
function showError() {
  current = "Error"; stored = null; operator = null;
  waitingForOperand = false; justCalculated = true;
  expression.textContent = "";
  update();
}
keys.addEventListener("click", e => {
  const b = e.target.closest("button");
  if (!b) return;
  if (b.dataset.value !== undefined) {
    const v = b.dataset.value;
    if (/^\d$/.test(v)) inputDigit(v);
    else chooseOperator(v);
    return;
  }
  const action = b.dataset.action;
  if (action === "decimal") decimal();
  if (action === "clear") clearAll();
  if (action === "sign") sign();
  if (action === "percent") percent();
  if (action === "equals") equals();
});
document.addEventListener("keydown", e => {
  if (/^\d$/.test(e.key)) inputDigit(e.key);
  else if (e.key === ".") decimal();
  else if (e.key === "+") chooseOperator("+");
  else if (e.key === "-") chooseOperator("−");
  else if (e.key === "*") chooseOperator("×");
  else if (e.key === "/") { e.preventDefault(); chooseOperator("÷"); }
  else if (e.key === "Enter" || e.key === "=") equals();
  else if (e.key === "Escape") clearAll();
  else if (e.key === "%") percent();
});
update();
