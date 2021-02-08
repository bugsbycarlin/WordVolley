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

for length in [4, 5, 6, 7, 8, 9]:
  words[length] = {}
  with open("raw_words.txt", "r") as raw_words:
    for line in raw_words:
      word = line.strip()
      if (re.match("[a-z]+$",word) and len(word) == length):
        words[length][word] = {}
    print("There are %d words of length %d" % (len(words[length]), length))



with open("legal_words.txt", "w") as outfile:
  for l in [4, 5, 6, 7]:
    print("Computing connections for length %d" % l)
    for word_1 in words[l]:
      for word_2 in words[l]:
        if singleDistance(word_1, word_2):
          words[l][word_1][word_2] = 1
          words[l][word_2][word_1] = 1
    print("Computed word connections. Now computing graph.")


    component = 0
    visited = {}
    visit_count = 0

    for word_1 in words[l]:
      if word_1 not in visited:
        component += 1
        queue = [word_1]
        in_queue = {word_1: 1}
        while(len(queue) > 0):
          q_word = queue.pop()
          visited[q_word] = component
          # visit_count += 1
          # if (visit_count % 300 == 0):
            # print("Visited %d" % visit_count)
          for word_2 in words[l][q_word]:
            if word_2 not in visited:
              if not word_2 in in_queue:
                queue.append(word_2)
                in_queue[word_2] = 1

    print("Number of components is %d" % (component))

    for i in range(1, component+1):
      component_count = 0
      for word in visited:
        if visited[word] == i:
          component_count += 1
      percent = component_count / len(words[l]) * 100
      if percent > 30:
        print("Writing the largest component to file.")
        for word in words[l]:
          if visited[word] == i:
            outfile.write(word + "\n")
