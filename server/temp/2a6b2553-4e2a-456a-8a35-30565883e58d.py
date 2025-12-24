
__inputs__ = iter([
"Kush"
])

def input(prompt=""):
    try:
        return next(__inputs__)
    except StopIteration:
        raise RuntimeError("Program requested more input than provided")

print("Hello world!")
a = input("Enter your name: ")
print(a)
