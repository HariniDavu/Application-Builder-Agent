# OddEvenChecker

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Status: Stable](https://img.shields.io/badge/Status-Stable-brightgreen.svg)](https://github.com/yourusername/odd_even_checker)

---

## Description

`odd_even.py` is a tiny command‑line utility that determines whether a given integer is **even** or **odd**. It demonstrates clean, testable Python code by separating pure logic (`parse_int`, `is_even`) from the command‑line interface.

## Prerequisites

- **Python 3.8** or newer (the script uses type hints and f‑strings).

## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/odd_even_checker.git
   ```
2. Change into the project directory:
   ```bash
   cd odd_even_checker
   ```
3. (Optional) Create and activate a virtual environment:
   ```bash
   python -m venv venv
   source venv/bin/activate   # on Windows use `venv\Scripts\activate`
   ```
4. No additional packages are required – the script runs with the standard library only.

## Usage

The script can be executed in two ways.

### 1. Pass the integer as a command‑line argument

```bash
python odd_even.py 42
```

### 2. Run without arguments and enter the value when prompted

```bash
python odd_even.py
```
You will see the prompt:
```
Enter an integer: 
```
Type the number and press **Enter**.

## Expected Output

- **Even number** (e.g., `42`):
  ```
  42 is even
  ```
- **Odd number** (e.g., `7`):
  ```
  7 is odd
  ```

## Error Handling

If the supplied input cannot be parsed as an integer, the program prints a clear error message to **stderr** and exits with status code **1**.

```bash
python odd_even.py hello
```
Output (to stderr):
```
Input must be an integer
```
The shell will report a non‑zero exit status (`echo $?` → `1`).

## Testing (optional)

When unit tests are added (e.g., using the built‑in `unittest` framework), they can be run with:

```bash
python -m unittest discover
```
or, if you prefer `pytest`:

```bash
pytest
```

---

## License

This project is licensed under the MIT License. See the `LICENSE` file for details.
