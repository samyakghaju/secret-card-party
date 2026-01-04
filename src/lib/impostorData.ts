// Categories and words for the Impostor game

export interface Category {
  id: string;
  name: string;
  icon: string;
  words: string[];
  color: string;
}

export const CATEGORIES: Category[] = [
  {
    id: "food",
    name: "Food & Drinks",
    icon: "🍕",
    color: "180 80% 70%",
    words: ["Pizza", "Sushi", "Burger", "Tacos", "Ice Cream", "Coffee", "Pasta", "Chocolate", "Steak", "Salad", "Sandwich", "Smoothie", "Pancakes", "Ramen", "Curry"]
  },
  {
    id: "animals",
    name: "Animals",
    icon: "🐾",
    color: "140 60% 60%",
    words: ["Dog", "Cat", "Elephant", "Lion", "Dolphin", "Eagle", "Snake", "Penguin", "Koala", "Giraffe", "Monkey", "Tiger", "Bear", "Rabbit", "Horse"]
  },
  {
    id: "movies",
    name: "Movies & TV",
    icon: "🎬",
    color: "280 70% 65%",
    words: ["Titanic", "Avatar", "Friends", "Batman", "Frozen", "Stranger Things", "The Office", "Star Wars", "Harry Potter", "Marvel", "Game of Thrones", "Inception", "Matrix", "Breaking Bad", "Jurassic Park"]
  },
  {
    id: "sports",
    name: "Sports",
    icon: "⚽",
    color: "35 90% 60%",
    words: ["Soccer", "Basketball", "Tennis", "Swimming", "Golf", "Baseball", "Hockey", "Boxing", "Volleyball", "Cricket", "Rugby", "Skiing", "Surfing", "Cycling", "Wrestling"]
  },
  {
    id: "places",
    name: "Places",
    icon: "🗺️",
    color: "200 70% 55%",
    words: ["Paris", "Beach", "Mountain", "Library", "Museum", "Hospital", "Airport", "Restaurant", "School", "Mall", "Zoo", "Church", "Casino", "Stadium", "Cinema"]
  },
  {
    id: "jobs",
    name: "Jobs",
    icon: "💼",
    color: "330 65% 60%",
    words: ["Doctor", "Teacher", "Chef", "Pilot", "Artist", "Lawyer", "Engineer", "Firefighter", "Actor", "Scientist", "Nurse", "Mechanic", "Writer", "Police", "Designer"]
  },
  {
    id: "objects",
    name: "Objects",
    icon: "📦",
    color: "45 80% 55%",
    words: ["Phone", "Guitar", "Clock", "Mirror", "Umbrella", "Camera", "Book", "Lamp", "Key", "Glasses", "Wallet", "Backpack", "Scissors", "Candle", "Pillow"]
  },
  {
    id: "actions",
    name: "Actions",
    icon: "🎭",
    color: "0 70% 65%",
    words: ["Dancing", "Swimming", "Cooking", "Reading", "Sleeping", "Running", "Singing", "Painting", "Driving", "Shopping", "Studying", "Traveling", "Gaming", "Fishing", "Climbing"]
  }
];

export const getRandomWord = (categoryId: string): string => {
  const category = CATEGORIES.find(c => c.id === categoryId);
  if (!category) return "Unknown";
  const randomIndex = Math.floor(Math.random() * category.words.length);
  return category.words[randomIndex];
};

export const getCategoryById = (id: string): Category | undefined => {
  return CATEGORIES.find(c => c.id === id);
};
