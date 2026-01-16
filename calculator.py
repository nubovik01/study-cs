def solve(type):
  first = float(input("Выберите первое число >>> "))
  second = float(input("Выберите второе число >>> "))

  return {
      "плюс": first + second,
      "минус": first - second,
      "умножение": first * second,
      "деление": first / second,
      "остаток": first % second,
      "корень": first ** second, 
  }.get(type, None)
  
choice = input("Выберите действие: плюс, минус, умножение, деление, остаток, корень >>> ").lower()

if choice in ("плюс", "минус", "умножение", "деление", "остаток", "корень"):
  print(solve(choice))
else:
  print("Такого варианта не существует, либо Вы неправильно указали")
