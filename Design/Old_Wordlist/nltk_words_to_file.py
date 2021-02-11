import nltk
import inflection
from nltk.corpus import words
with open("outfile.txt", "w") as outfile:
  for word in words.words():
    outfile.write(word.lower() + "\n")
    outfile.write(inflection.pluralize(word).lower() + "\n")


