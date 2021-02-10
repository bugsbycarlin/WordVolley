import re
import sys

common_words = {}

#
# This one modifies legal_words.txt by reading gutenberg books and
# marking the legal words that are found in these books.
# Doing this helps restrict the starting word set to words
# people will like to see.
#

for i in range(0, 6):
  book_name = "book_" + str(i) + ".txt"
  with open(book_name) as book_file:
    for line in book_file:
      clean_line = re.sub("[^0-9a-zA-Z]+", " ", line)
      words = clean_line.split(" ")
      for word in words:
        common_words[word.lower()] = 1


counts = {}
counts[4] = 0
counts[5] = 0
counts[6] = 0
counts[7] = 0
common_counts = {}
common_counts[4] = 0
common_counts[5] = 0
common_counts[6] = 0
common_counts[7] = 0
with open("unmarked_legal_words.txt", "r") as infile:
  with open("legal_words.txt", "w") as outfile:
    for line in infile:
      word = line.strip()
      counts[len(word)] += 1
      if word in common_words:
        common_counts[len(word)] += 1
        outfile.write("1," + word + "\n")
      else:
        outfile.write("0," + word + "\n")

for i in range(4,8):
  print("For length %d, there were %d words and %d common ones." % (i, counts[i], common_counts[i]))
