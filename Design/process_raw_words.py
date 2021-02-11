import re
import sys

words = {}

def singleDistance(word_1, word_2):
  if word_1 == word_2:
    return False
  count = 0
  # same length assumed
  for i, char in enumerate(word_1):
    if word_2[i] != char:
      count += 1
      if count > 1:
        return False
  return True

