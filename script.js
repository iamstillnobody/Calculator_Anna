// изначально кнопка = не нажата
let equal_pressed = false;
// все кнопки для ввода, за исключением кнопок AC, DEL, =
let button_input = document.querySelectorAll(".input-button");
// окно для ввода
let input = document.getElementById("input");
// кнопки AC, DEL, =
let clear = document.getElementById("clear");
let erase = document.getElementById("erase");
let equal = document.getElementById("equal");

// функция, вычисляющая введённое выражение
function evaluate(expression) {
  let tokens = expression.split(""); // разбиваем выражение на символы

  let values = []; // стэк чисел

  let ops = []; // стэк операторов

  // проверяем выражение на синтаксическую корректность
  let expressionCorrect = checkExprSyntax(tokens); 

  // если выражение синтаксически корректно, начинаем вычисления
  if (expressionCorrect == true) {
    // проходимся по выражению посимвольно
    for (let i = 0; i < tokens.length; i++) {
      // если текущий символ -- число, добавляем его в стэк
      if (tokens[i] >= "0" && tokens[i] <= "9") {
        let stringNumber = ""; // храним число в виде строки

        let floatNumber = false; // изначально считаем, что число integer
        
        // если число содержит несколько цифр и/или является float
        while (i < tokens.length && ((tokens[i] >= "0" && tokens[i] <= "9") || tokens[i] == ".")) {
          stringNumber = stringNumber + tokens[i]; // формируем число
          
          if (tokens[i] == ".") // если встретилось ".", то число float
            floatNumber = true;
            
          i++;
        }
        if (floatNumber == true) // преобразуем строку в число и добавляем его в стэк чисел
          values.push(parseFloat(stringNumber));
        else 
          values.push(parseInt(stringNumber, 10));

        // В результате выполнения цикла while индекс i указывает на оператор, который мы должны рассмотреть.
        // Однако цикл for увеличит индекс i, и мы пропустим этот оператор. Чтобы это предотвратить, мы
        // сделаем шаг назад.  
        i--;
      }
      // если текущий символ -- оператор, добавляем его в стэк
      else if (tokens[i] == "+" || tokens[i] == "-" || tokens[i] == "*" || tokens[i] == "/" || tokens[i] == "%") {
        // Пока предыдущий оператор (верхний оператор стэка) имеет приоритет, больший или равный приоритету
        // текущего оператора (его ещё нет в стэке), выполняем вычисления, а именно применяем
        // верхний оператор к двум верхним элементам стэка чисел.
        while (ops.length > 0 && hasPrecedence(ops[ops.length - 1], tokens[i])) {
          answer = applyOp(ops.pop(), values.pop(), values.pop());
          // answer[1] хранит информацию об ошибке "деление на 0"
          // если выражение содержит деление на 0, то оно некорректно
          if (answer[1] == true) {
            expressionCorrect = false;
            break;
          }
          // answer[0] хранит результат выполнения операции Op над двумя числами
          values.push(answer[0]); // полученный результат кладём в стэк
        }

        // добавляем текущий оператор в стэк
        if (expressionCorrect == true) 
          ops.push(tokens[i]);
      }
    }

    // прошлись по всему выражению; завершаем вычисления
    if (expressionCorrect == true) // если выражение корректно (нет деления на 0), доводим вычисления до конца
      while (ops.length > 0) {
        answer = applyOp(ops.pop(), values.pop(), values.pop());
        // answer[1] хранит информацию об ошибке "деление на 0"
        // если выражение содержит деление на 0, то оно некорректно
        if (answer[1] == true) {
          expressionCorrect = false;
          break;
        }
        else
        // answer[0] хранит результат выполнения операции Op над двумя числами
        values.push(answer[0]); // полученный результат кладём в стэк
      }

    if (expressionCorrect == true) // если выражение корректно (не было деления на 0 и мы довели вычисления до конца),
      return values.pop(); // оставшийся в стэке чисел элемент -- это результат всех вычислений
    else // иначе
      return 0; // просто возвращаем 0 (не продолжаем вычисления)
  } 
  else { // если выражение синтаксически некорректно
    alert("Invalid expression!");
    return 0;
  }
}

// проверка, что оператор op2 имеет приоритет выше приоритета оператора op1 или равный ему
function hasPrecedence(op2, op1) {
  // операторы *, /, % имеют приоритет выше, чем операторы + и -
  if ((op1 == "*" || op1 == "/" || op1 == "%") && (op2 == "+" || op2 == "-"))
    return false;
  return true;
}

// выполнение операции над числами a, b
// (замечание: b пишем перед a, т. к. b (это второе число) хранится в стэке выше)
// функция возвращает массив [value=number, error=true/false]
function applyOp(op, b, a) {
  switch (op) {
    case "+":
      return [a + b, false];
    case "-":
      return [a - b, false];
    case "*":
      return [a * b, false];
    case "/":
      if (b == 0) { // если операция деления на 0, то возвращаем value=0 и error=true
        alert("Cannot divide by zero! (exact division)");
        return [0, true]; 
      } 
      else 
        return [a / b, false];
    case "%":
      if (b == 0) { // если операция деления с остатком на 0, то возвращаем value=0 и error=true
        alert("Cannot divide by zero! (division with remainder/Euclidean division)"); 
        return [0, true];
      } 
      else 
        return [a % b, false];
  }
}

// проверка, является ли символ оператором или точкой
function isOpOrPoint(char) {
  if (char == "+" || char == "-" || char == "*" || char == "/" || char == "%" || char == ".")
    return true;
  return false;
}

// проверка выражения на синтаксическую корректность 
// (рядом нет двух операторов/оператора и точки; выражение не начинается и не заканчивается оператором/точкой)
function checkExprSyntax(expr) {
  let conseqOps = false;
  for (let i = 0; i < expr.length - 1; i++)
    if ((isOpOrPoint(expr[i]) && isOpOrPoint(expr[i + 1])) || isOpOrPoint(expr[0]) || isOpOrPoint(expr[expr.length-1])) {
      conseqOps = true;
      break;
    }
  if (conseqOps == true) 
    return false;
  return true;
}

// получаем доступ к кнопкам, используя forEach
button_input.forEach((button_class) => {
  button_class.addEventListener("click", () => {
    if (equal_pressed == true) { // если нажата кнопка = ,
      input.value = ""; // то очищаем введённое выражение
      equal_pressed = false; // и считаем, что кнопка = больше не нажата
    }
    // запоминаем отображаемое значение каждой кнопки
    input.value += button_class.value;
  });
});

// при нажатии на кнопку = вычисляем введённое выражение
equal.addEventListener("click", () => {
  equal_pressed = true; // считаем, что кнопка = нажата
  let expression = input.value;
  try {
    // вычисляем введённое выражение
    let solution = evaluate(expression);
    // если ответ -- целое число, то ответ остаётся без изменений,
    // иначе устанавливаем кол-во знаков после запятой равным 8
    if (Number.isInteger(solution)) {
      input.value = solution;
    } else {
      input.value = solution.toFixed(8);
    }
  } catch (error) {
    // введено некорректное выражение
    alert("Some error occurred.");
    input.value = ""; // очищаем введённое выражение
  }
});

// при нажатии на кнопку AC очищаем ввод
clear.addEventListener("click", () => {
  input.value = "";
});

// при нажатии на кнопку DEL отменяем последний введённый символ
erase.addEventListener("click", () => {
  if (equal_pressed == false)
    input.value = input.value.substr(0, input.value.length - 1);
});
