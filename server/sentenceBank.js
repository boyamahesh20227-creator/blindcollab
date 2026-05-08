const SENTENCES = {
  2: [
    'red apple', 'flying pig', 'sad robot', 'angry sun', 'big cake',
    'sleeping cat', 'dancing tree', 'crying moon', 'happy cloud', 'melting ice',
    'broken heart', 'singing fish', 'frozen time', 'burning rain', 'lost key',
    'fast snail', 'cold fire', 'sweet lemon', 'invisible friend', 'giant ant',
    'tiny elephant', 'shy lion', 'brave mouse', 'lazy dragon', 'loud silence',
  ],
  3: [
    'cat eats pizza', 'dog rides bike', 'fish flies high', 'cow plays guitar',
    'bird drinks coffee', 'frog reads book', 'bear makes pancakes', 'duck drives car',
    'lion sings opera', 'fox paints clouds', 'owl teaches math', 'pig builds house',
    'wolf knits sweater', 'hen wins lottery', 'shark files taxes', 'goat bakes bread',
    'whale learns yoga', 'rabbit runs election', 'deer fixes plumbing', 'bat reads map',
  ],
  4: [
    'monkey drives a car', 'elephant plays the piano', 'baby shark loves pizza',
    'grandma rides a skateboard', 'cat files the taxes', 'robot falls in love',
    'wizard forgets his wand', 'astronaut grows a garden', 'knight orders fast food',
    'dragon takes a nap', 'shark attends a meeting', 'dinosaur uses a phone',
    'penguin eats hot soup', 'ghost buys some groceries', 'snail wins the marathon',
    'bear opens a bakery', 'alien rents an apartment', 'pirate learns to code',
    'vampire visits the dentist', 'mermaid takes a taxi',
  ],
  5: [
    'grandma surfs on a wave', 'sun wears a big hat', 'cat is filing the taxes',
    'robot is learning to swim', 'dog gives a TED talk', 'cloud argues with the wind',
    'cactus relaxes at a spa', 'wizard is stuck in traffic', 'ninja shops for groceries',
    'volcano has a small picnic', 'penguin goes on a date', 'monkey types a long email',
    'bear eats honey in traffic', 'alien lands in a garden', 'fish goes to the school',
    'ghost haunts the wrong house', 'dragon tries to make friends', 'knight stuck in elevator',
    'mermaid orders food online', 'pirate learns to parallel park',
  ],
  6: [
    'cat rides a dragon to school', 'elephant paints a rainbow in rain',
    'robot tries to bake a birthday cake', 'penguin dances at a disco party',
    'wizard forgets to buy his groceries', 'bear gets lost in a shopping mall',
    'alien tries coffee for the first time', 'snowman melts in a hot yoga class',
    'cactus joins a swimming pool session', 'grandma wins a surfing competition today',
    'vampire is afraid of the dark', 'dinosaur applies for a bank loan',
    'shark teaches swimming at school', 'pirate searches for buried treasure chest',
    'ghost tries to use a smartphone',
  ],
  7: [
    'a dog gives a TED talk on cats', 'grandma wins a race on a skateboard',
    'cat tries to file its taxes online', 'a robot falls in love with a toaster',
    'penguin applies for a job as lifeguard', 'elephant learns to play electric guitar',
    'bear opens a cozy bakery on the moon', 'wizard forgets the spell and panics loudly',
    'alien tries to return a broken toaster', 'pirate gets lost using a treasure map',
  ],
};

function getSentence(wordCount) {
  const key = Math.min(Math.max(wordCount, 2), 7);
  const list = SENTENCES[key];
  return list[Math.floor(Math.random() * list.length)];
}

module.exports = { getSentence };
