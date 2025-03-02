import random

number = random.randint(0, 100)

def guess():
  print("Игра \"Угадай число\"")

  attempts = 0

  while True:
    try:
      attempt = float(input("Напиши число от 0 до 100 (выход: -1): "))

      if attempt == -1:
        break

      attempts += 1

      if attempt == number:
        print(f"Ты угадал с {attempts} попытки!")
        break

      if attempt < number:
        print("Загаданное число больше.")
      else:
        print("Загаданное число меньше.")

    except ValueError:
      print("Требовалось указать числовое значение.")

if __name__ == "__main__":
  guess()