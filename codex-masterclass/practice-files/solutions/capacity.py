"""Reference solution for a synthetic capacity exercise."""
def remaining_seats(capacity, confirmed):
    if type(capacity) is not int or type(confirmed) is not int:
        raise ValueError('Capacity and confirmed seats must be whole numbers.')
    if capacity < 0 or confirmed < 0 or confirmed > capacity:
        raise ValueError('Confirmed seats must fall between zero and capacity.')
    return capacity - confirmed

def can_reserve(capacity, confirmed, requested):
    remaining = remaining_seats(capacity, confirmed)
    if type(requested) is not int or requested < 0:
        raise ValueError('Requested seats must be a nonnegative whole number.')
    return requested <= remaining
