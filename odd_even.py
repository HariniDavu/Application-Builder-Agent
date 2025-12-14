"""Utility functions for parsing integers and determining parity.

This module provides two pure functions that are used by the CLI entry
point in :pymod:`odd_even_checker.main`.  Keeping them in a separate module
makes them easy to test and reuse without pulling in any I/O logic.
"""

import sys


def parse_int(value: str) -> int:
    """Convert *value* to an integer.

    Parameters
    ----------
    value: str
        The string representation of the integer to be parsed.

    Returns
    -------
    int
        The integer value represented by *value*.

    Raises
    ------
    ValueError
        If *value* cannot be converted to an integer. The error message is
        explicit to aid the caller in presenting a clear error to the user.
    """
    try:
        return int(value)
    except Exception:
        # Raising a new ValueError with a clear, user‑friendly message.
        raise ValueError("Input must be an integer")


def is_even(number: int) -> bool:
    """Return ``True`` if *number* is even, otherwise ``False``.

    The function uses the standard modulo operation to determine parity.
    ``0`` is considered even, matching the mathematical definition.
    """
    return number % 2 == 0


def main() -> None:
    """Command‑line interface for the odd/even checker.

    The function reads an integer either from the first command‑line argument
    or, if none is provided, via ``input``. It validates the input using
    :func:`parse_int`, reports parsing errors to ``stderr`` and exits with a
    non‑zero status code, and finally prints whether the number is even or odd.
    """
    # Determine the raw input string.
    if len(sys.argv) > 1:
        raw = sys.argv[1]
    else:
        raw = input("Enter an integer: ")

    # Parse and validate the integer.
    try:
        n = parse_int(raw)
    except ValueError as e:
        print(e, file=sys.stderr)
        sys.exit(1)

    # Determine parity and output the result.
    if is_even(n):
        print(f"{n} is even")
    else:
        print(f"{n} is odd")


if __name__ == "__main__":
    main()
