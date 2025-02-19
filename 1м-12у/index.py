def calculator():
  while True:
    operation = input("Введите действие (*, /, +, -, **, //, %): ")

    if operation.lower() == "стоп":
      break

    try:
      number1 = float(input("Введите первое число: "))
      number2 = float(input("Введите второе число: "))

      if operation == "*":
        result = number1 * number2
      elif operation == "/":
        if number2 == 0:
          print("Деление на ноль невозможно!")
          continue
        result = number1 / number2
      elif operation == "+":
        result = number1 + number2
      elif operation == "-":
        result = number1 - number2
      elif operation == "**" or operation == "^":
        result = number1 ** number2
      elif operation == "//":
        if number2 == 0:
          print("Деление на ноль невозможно!")
          continue
        result = number1 // number2
      elif operation == "%":
        if number2 == 0:
          print("Деление на ноль невозможно!")
          continue
        result = number1 % number2
      else:
        print("Неверный знак операции!")
        continue

      print("Результат:", result)

    except ValueError:
      print("Требовалось указать числовое значение.")
    except Exception as error:
      print("Произошла ошибка:", error)

if __name__ == "__main__":
  calculator()