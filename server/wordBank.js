const WORDS = [
  // Funny
  'grandma skateboarding',
  'dog giving a TED talk',
  'cat filing taxes',
  'penguin on a first date',
  'bear stuck in an elevator',
  'owl running for president',
  'hamster as a DJ',
  'sloth in a sprint race',
  'goat at a fancy restaurant',
  'parrot at a job interview',
  // Action
  'astronaut cooking noodles',
  'wizard stuck in traffic',
  'ninja grocery shopping',
  'robot learning to swim',
  'knight ordering pizza',
  'vampire at the dentist',
  'pirate using GPS',
  'superhero doing laundry',
  'dinosaur in yoga class',
  'alien learning to drive',
  // Everyday
  'pizza delivery in rain',
  'Monday morning feeling',
  'waiting for wifi to connect',
  'charging phone at 1 percent',
  'missing the last bus',
  'finding money in old jeans',
  'burning toast',
  'autocorrect disaster',
  'forgetting why you walked in',
  'alarm clock betrayal',
  // Nature
  'volcano having a picnic',
  'fish going to school',
  'clouds having an argument',
  'cactus at a spa',
  'snail winning a race',
  'trees learning to dance',
  'moon doing homework',
  'sun wearing sunglasses',
  'lightning bolt taking a nap',
  'wind learning to whistle',
  // Abstract
  'winning an argument online',
  'that 3am feeling',
  'explaining memes to grandparents',
  'buffering',
  'existential crisis at IKEA',
  'FOMO hitting different',
  'brain going on vacation',
  'dreams loading slowly',
  'motivation on a Monday',
  'overthinking a text reply',
  'sunday scaries',
  'wifi password emergency',
  'low battery anxiety',
  'meeting that could have been an email',
];

function getRandomWord() {
  return WORDS[Math.floor(Math.random() * WORDS.length)];
}

module.exports = { WORDS, getRandomWord };
