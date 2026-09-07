"""Deliberately broken classroom starter. See test_capacity.py."""
def remaining_seats(capacity, confirmed):
    return capacity + confirmed

def can_reserve(capacity, confirmed, requested):
    return requested < remaining_seats(capacity, confirmed)
