# Copyright 2024 Marimo. All rights reserved.
import io
from pickle import Pickler, HIGHEST_PROTOCOL, PicklingError, loads as pickle_loads
from typing import Any, IO

__all__ = ["SortedSetPickler", "dumps", "loads", "PicklingError"]


# Custom reduction functions for set and frozenset to ensure deterministic
# pickling by sorting elements.
def _reduce_set(s: set[Any]) -> tuple[type, tuple[list[Any]]]:
    # sorted() is deterministic
    return set, (sorted(list(s)),)


def _reduce_frozenset(fs: frozenset[Any]) -> tuple[type, tuple[list[Any]]]:
    # sorted() is deterministic
    return frozenset, (sorted(list(fs)),)


# A custom pickler that uses a dispatch table to handle sets and frozensets
# in a deterministic way.
# https://docs.python.org/3/library/pickle.html#dispatch-tables
class SortedSetPickler(Pickler):
    def __init__(self, file: IO[bytes], protocol: int | None = None) -> None:
        super().__init__(file, protocol)
        self.dispatch_table = {
            set: _reduce_set,
            frozenset: _reduce_frozenset,
        }


def dumps(obj: Any) -> bytes:
    """
    Pickle an object using a custom pickler that sorts sets and frozensets
    for deterministic output.
    """
    with io.BytesIO() as buffer:
        SortedSetPickler(buffer, HIGHEST_PROTOCOL).dump(obj)
        return buffer.getvalue()


def loads(blob: bytes) -> Any:
    """
    Unpickle an object.

    The standard unpickler can unpickle data pickled with SortedSetPickler.
    """
    return pickle_loads(blob) 