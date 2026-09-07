import unittest
from capacity import remaining_seats, can_reserve

class CapacityTests(unittest.TestCase):
    def test_remaining(self):
        self.assertEqual(remaining_seats(20, 8), 12)
    def test_empty_and_full(self):
        self.assertEqual(remaining_seats(20, 0), 20)
        self.assertEqual(remaining_seats(20, 20), 0)
    def test_exact_remaining_is_allowed(self):
        self.assertTrue(can_reserve(20, 8, 12))
    def test_above_remaining_fails(self):
        self.assertFalse(can_reserve(20, 8, 13))
    def test_no_capacity(self):
        self.assertFalse(can_reserve(20, 20, 1))
    def test_zero_request_is_valid(self):
        self.assertTrue(can_reserve(20, 0, 0))
        self.assertTrue(can_reserve(20, 20, 0))
    def test_invalid_requested(self):
        for value in (-1, 1.5, '2', True, None):
            with self.subTest(value=value), self.assertRaises(ValueError):
                can_reserve(20, 8, value)
    def test_invalid_capacity_and_confirmed(self):
        for capacity,confirmed in ((-1,0),(20,-1),(20,21),(20,2.5),(True,0)):
            with self.subTest(capacity=capacity,confirmed=confirmed), self.assertRaises(ValueError):
                remaining_seats(capacity,confirmed)

if __name__=='__main__': unittest.main()
