import re
import sys
from nltk.corpus import wordnet

word_info = {}
just_words = {}
kernel = {}
max_length = 0

with open("raw_words.txt", "r") as raw_words:
  for line in raw_words:
    word = line.strip().lower()
    word_info[word] = {
      "common": 0,
      "pos": {
        "a": 0,
        "v": 0,
        "n": 0,
        "r": 0,
      }
    }
    if not len(word) in just_words:
      just_words[len(word)] = []
    just_words[len(word)].append(word)
    if len(word) > max_length:
      max_length = len(word)
for key in just_words:
  print("There are %d words of length %d" % (len(just_words[key]), key))





#
# Check words against some project gutenberg books and mark some words as common
#
print("Checking common words")
common_words = {}
common_of_length = {
  4: {},
  5: {},
  6: {},
  7: {},
}
for i in range(0, 12):
  book_name = "book_" + str(i) + ".txt"
  with open(book_name) as book_file:
    for line in book_file:
      clean_line = re.sub("[^0-9a-zA-Z]+", " ", line)
      words = clean_line.split(" ")
      for word in words:
        if not word.lower() in common_words:
          common_words[word.lower()] = 1
        else:
          common_words[word.lower()] += 1

for word in word_info:
  if word in common_words and common_words[word] > 2 and len(word) >= 4 and len(word) <= 7:
    word_info[word]["common"] = 1
    common_of_length[len(word)][word] = 1


#
# Check if a word can't be reached from any word, or if it can only be reached
# from one other word. Mark it as dead, so the game can warn players about it.
#

#
# First, prep to check for dead words by defining a bunch of edit distance comparison functions
#
def singleEditDistance(word_1, word_2):
  if len(word_1) != len(word_2):
    return False
  count = 0
  # same length assumed
  for i, char in enumerate(word_1):
    if word_2[i] != char:
      count += 1
      if count > 1:
        return False
  return True

def singleSwap(word_1, word_2):
  if len(word_1) != len(word_2):
    return False
  for i in range(0,len(word_1)):
    for j in range(i, len(word_1)):
      swap_word = list(word_1)
      swap_word[i] = word_1[j]
      swap_word[j] = word_1[i]
      swap_word = "".join(swap_word)
      if swap_word == word_2:
        return True
  return False

alphabet = list("abcdefghijklmnopqrstuvwxyz")
def singleInsertion(word_1, word_2):
  if len(word_1) + 1 != len(word_2):
    return False
  for i in range(0, len(word_1) + 1):
    left = word_1[0:i]
    right = word_1[i:]
    for letter in alphabet:
      insertion_word = left + letter + right
      if insertion_word == word_2:
        return True
  return False


def singleDeletion(word_1, word_2):
  if len(word_1) != len(word_2) + 1:
    return False
  for i in range(0, len(word_1)):
    new_word = word_1[:i] + word_1[(i+1):]
    if new_word == word_2:
      return True
  return False


def singleDistance(word_1, word_2):
  # word isn't single distance from itself
  if word_1 == word_2:
    return False

  # words are too far apart
  if abs(len(word_1) - len(word_2)) > 1:
    return False

  # single character edits
  if singleEditDistance(word_1, word_2) == True:
    return True

  # swaps
  if singleSwap(word_1, word_2) == True:
    return True

  # insertions
  if singleInsertion(word_1, word_2) == True or singleInsertion(word_2, word_1) == True:
    return True

  if singleDeletion(word_1, word_2) == True or singleDeletion(word_2, word_1) == True:
    return True

  return False

#
# Now, don't actually run the dead word checks. They're too expensive.
#
# for length in just_words:

#   print("Checking for dead words length %d" % (length))
#   zeros = 0
#   ones = 0
#   for count, word_1 in enumerate(just_words[length]):
#     neighbors = {}
#     if count % 5000 == 0:
#       print("Checking dead words of length %d, on word %d out of %d" % (length, count, len(just_words[length])))
#     checks = []
#     if length > 2:
#       checks.append(length - 1)
#     checks.append(length)
#     if length < max_length:
#       checks.append(length + 1)
#     for alt_length in checks:
#       for word_2 in just_words[alt_length]:
#         if singleDistance(word_1, word_2):
#           neighbors[word_2] = 1
#         if len(neighbors) >= 2:
#           break
#         dunce += 1
#     if len(neighbors) == 0:
#       zeros += 1
#       word_info[word_1]["dead"] = 1
#     elif len(neighbors) == 1:
#       ones = 1
#       word_info[word_1]["dead"] = 1
#   print("Found %d unreachable words" % (zeros))
#   print("Found %d dead end words" % (ones))




#
# Instead, just check the commons to make sure they aren't dead ends.
#
for length in [4,5,6,7]:
  print("There are %d common words of length %d" % (len(common_of_length[length]), length))
  count = 0
  unreachable_count = 0
  for word in common_of_length[length]:
    if count % 100 == 0:
      print("Working on word %d. So far %d unreachables." % (count, unreachable_count))
    count += 1
    unreachable = True
    for word_2 in just_words[length]:
      if singleDistance(word, word_2):
        unreachable = False
        break
    if unreachable:
      word_info[word]["common"] = 0
      unreachable_count += 1
  print("Changed %d words back because they were unreachable." % unreachable_count)



#
# Check parts of speech for silly fun in the future!
#
print("Checking parts of speech")
for count, word in enumerate(word_info):
  if count % 10000 == 0:
    print("Checking parts of speech for word %d" % (count))
  synset = wordnet.synsets(word)
  for entry in synset:
    item = str(entry).split(".")
    part_of_speech = item[1]
    if part_of_speech == "s" or part_of_speech == "a":
      word_info[word]["pos"]["a"] = 1
    elif part_of_speech == "n":
      word_info[word]["pos"]["n"] = 1
    elif part_of_speech == "v":
      word_info[word]["pos"]["v"] = 1
    elif part_of_speech == "r":
      word_info[word]["pos"]["r"] = 1


#
# Write to legal_words.txt
#
with open("legal_words.txt", "w") as legal_words:
  for word in word_info:
    info = word_info[word]
    pos_string = ""
    for key in ["a", "v", "n", "r"]:
      if word_info[word]["pos"][key] == 1:
        pos_string += key
    legal_words.write("%s,%s,%s\n" % (word, info["common"], pos_string))