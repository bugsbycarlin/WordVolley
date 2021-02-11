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

l = 5

for word_1 in words[l]:
  for word_2 in words[l]:
    if singleDistance(word_1, word_2):
      words[l][word_1][word_2] = 1
      words[l][word_2][word_1] = 1
print("Computed word connections")


component = 0
visited = {}
visit_count = 0
sys.setrecursionlimit(9000)

# def visit(word_1):
#   global component
#   global visited
#   global visit_count
#   visited[word_1] = component
#   visit_count += 1
#   if (visit_count % 300 == 0):
#     print("Visited %d" % visit_count)
#   for word_2 in words[l][word_1]:
#     if not word_2 in visited:
#       visit(word_2)


for word_1 in words[l]:
  if word_1 not in visited:
    component += 1
    queue = [word_1]
    while(len(queue) > 0):
      q_word = queue.pop()
      visited[q_word] = component
      # visit_count += 1
      # if (visit_count % 300 == 0):
        # print("Visited %d" % visit_count)
      for word_2 in words[l][q_word]:
        if word_2 not in visited:
          queue.append(word_2)

print("Number of components is %d" % (component))
print("")

for i in range(1, component+1):
  component_count = 0
  for word in visited:
    if visited[word] == i:
      component_count += 1
  print("Component %d has %d elements." % (i, component_count))
  if component_count < 5:
    # pass
    small_component_words = []
    for word in visited:
      if visited[word] == i:
        small_component_words.append(word)
    print(",".join(small_component_words))
  else:
    dead_end_count = 0
    for word in visited:
      if visited[word] == i and len(words[l][word]) == 1:
        dead_end_count += 1
    print("This large component has %d dead ends." % (dead_end_count))