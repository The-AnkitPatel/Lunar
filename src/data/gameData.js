// Love Quiz Questions - Personalized Q&A
export const loveQuizQuestions = [
    {
        id: 1,
        question: "What date did we officially become a couple? 💕",
        options: ["January 10, 2026", "January 12, 2026", "January 15, 2026", "February 14, 2026"],
        correctAnswer: 1,
        loveMessage: "Yes! January 12, 2026 - The day I proposed and you said yes! 💕",
        storyHint: "The day I proposed and everything changed forever..."
    },
    {
        id: 2,
        question: "How long did I try to win your heart? 🥺",
        options: ["6 months", "1 year", "2 years", "3 years"],
        correctAnswer: 2,
        loveMessage: "2 years of trying, hoping, and never giving up — and it was worth every second! ❤️",
        storyHint: "Patience is the purest form of love..."
    },
    {
        id: 3,
        question: "What's the one thing I love most about you? 🌟",
        options: ["Your smile", "Your laugh", "Your heart", "Everything!"],
        correctAnswer: 3,
        loveMessage: "Trick question - I love EVERYTHING about you! 🥰",
        storyHint: "How can I pick one when everything about you is perfect?"
    },
    {
        id: 4,
        question: "What would I do without you? 🤔",
        options: ["Be fine", "Miss you a little", "Be lost forever", "I can't even imagine"],
        correctAnswer: 3,
        loveMessage: "I literally cannot imagine my life without you. You ARE my life! 💖",
        storyHint: "Before you, I was surviving. Now I'm living."
    },
    {
        id: 5,
        question: "How much do I love you? 💗",
        options: ["A lot", "More than pizza", "To infinity", "Beyond infinity and back"],
        correctAnswer: 3,
        loveMessage: "Beyond infinity and back... and then some more! 🚀💕",
        storyHint: "If love could be measured, they'd need a new unit for us."
    },
    {
        id: 6,
        question: "Who proposed first? 😏",
        options: ["She proposed to me", "I proposed to her", "We both said it together", "It just happened magically"],
        correctAnswer: 1,
        loveMessage: "I finally gathered all my courage and proposed! And she said YES! 💍",
        storyHint: "January 12, 2026 — the bravest, sweetest moment..."
    },
    {
        id: 7,
        question: "What's the first thing I want to do when we meet? 🥺",
        options: ["Say hi casually", "Shake hands", "Hug you so tight you can't breathe", "Stare at you and cry happy tears"],
        correctAnswer: 2,
        loveMessage: "I'll hold you so tight that the whole world will disappear! 🤗💕",
        storyHint: "The distance makes the heart grow fonder..."
    },
    {
        id: 8,
        question: "What type of relationship do we have? 💕",
        options: ["Regular relationship", "Long Distance Relationship", "Friendship", "It's complicated"],
        correctAnswer: 1,
        loveMessage: "LDR — but distance means nothing when someone means everything! 🌍❤️",
        storyHint: "Miles apart but hearts always together..."
    },
    {
        id: 9,
        question: "What's my favorite thing about talking to you? 💭",
        options: ["Your jokes", "Your voice", "The way you understand me", "Everything about our conversations"],
        correctAnswer: 3,
        loveMessage: "Everything about our conversations is magical! I never want them to end! ✨",
        storyHint: "Late night talks that feel like they last 5 minutes..."
    },
    {
        id: 10,
        question: "If I could give you one thing in the world, what would it be? 🎁",
        options: ["A diamond ring", "A trip around the world", "My heart forever", "The entire universe"],
        correctAnswer: 2,
        loveMessage: "My heart is already yours! It has been since the moment I fell for you! 💝",
        storyHint: "There's nothing more valuable than a heart that beats for you..."
    }
];

// Spin Wheel Love Messages
export const wheelMessages = [
    { text: "Close your eyes & imagine hugging me for 1 minute 🤗", icon: "🤗", category: "romantic" },
    { text: "Send a flying kiss video right now! 😘", icon: "😘", category: "fun" },
    { text: "Text me the thing you miss most about me 💭", icon: "💭", category: "sweet" },
    { text: "Dedicate a song to me & send link 🎵", icon: "🎵", category: "romantic" },

    { text: "Write a 4-line shayari/poem about us right now ✍️", icon: "✍️", category: "creative" },
    { text: "Tell me your favorite dream about us 🌙", icon: "🌙", category: "sweet" },
    { text: "Send me your cutest selfie making a heart 📸", icon: "📸", category: "fun" }
];

// Spin Wheel Categories
export const wheelCategories = [
    { id: 'all', label: '🎲 Mix', color: 'from-pink-500 to-purple-500' },
    { id: 'romantic', label: '💕 Romantic', color: 'from-rose-500 to-red-500' },
    { id: 'fun', label: '🎉 Fun', color: 'from-amber-500 to-orange-500' },
    { id: 'sweet', label: '🍬 Sweet', color: 'from-pink-400 to-pink-600' },
    { id: 'creative', label: '✨ Creative', color: 'from-purple-500 to-indigo-500' },
];

// Memory Game Cards - Each pair represents a meaningful moment
export const memoryCards = [
    { id: 1, emoji: "☕", matched: false, memory: "Our first late night conversation" },
    { id: 2, emoji: "📱", matched: false, memory: "The first text that started it all" },
    { id: 3, emoji: "🌙", matched: false, memory: "Those 2 AM calls we never wanted to end" },
    { id: 4, emoji: "💍", matched: false, memory: "January 12 — the day I proposed" },
    { id: 5, emoji: "🎵", matched: false, memory: "Our song that makes my heart race" },
    { id: 6, emoji: "✈️", matched: false, memory: "The distance that makes us stronger" },
    { id: 7, emoji: "😊", matched: false, memory: "Her laugh — the most beautiful sound" },
    { id: 8, emoji: "💌", matched: false, memory: "Love letters & long messages" }
];

// Love Facts for reveal cards — "Open When" letters
export const loveFacts = [
    { text: "I think about you approximately 1000 times a day 💭", envelope: "Open when you miss me", seal: "💭" },
    { text: "Your smile is my favorite notification — my heart jumps every time 📱💕", envelope: "Open when you feel alone", seal: "📱" },
    { text: "Being with you feels like coming home, even across all these miles 🏠❤️", envelope: "Open when the distance hurts", seal: "🏠" },
    { text: "You make ordinary moments feel extraordinary — even a simple text from you changes my whole day ✨", envelope: "Open when you need a smile", seal: "✨" },
    { text: "I fall more in love with you every single day. It shouldn't be possible, but it is 📈💗", envelope: "Open when you doubt us", seal: "💗" },
    { text: "You're my favorite hello and hardest goodbye. But soon, there won't be goodbyes 👋💕", envelope: "Open when you can't sleep", seal: "🌙" },
    { text: "In a world full of people, across all this distance, my heart still found you. That's not luck — that's destiny 💕", envelope: "Open when you feel unlucky", seal: "🍀" },
    { text: "You're the reason I believe in magic — because how else do you explain what I feel for you? ✨🪄", envelope: "Open when you need magic", seal: "🪄" },
    { text: "I can't hold your hand yet, but I'm holding your heart. Always. 🤝💖", envelope: "Open when you want a hug", seal: "🤗" },
    { text: "The day we finally meet, I'm not letting go. Not for a second. 🥺💕", envelope: "Open when you daydream about us", seal: "💫" }
];

// ============================================
// LOVE COUPONS
// ============================================
export const loveCoupons = [
    {
        id: 1, icon: "🎬", title: "Movie Night Pass", category: "fun",
        description: "One free movie night with your choice of film, snacks, and unlimited virtual cuddles!",
        expiry: "March 14, 2026"
    },
    {
        id: 2, icon: "🍳", title: "Breakfast in Bed", category: "pampering",
        description: "When we meet — wake up to your favorite breakfast served with love!",
        expiry: "December 31, 2026"
    },
    {
        id: 3, icon: "💆", title: "30-Min Massage", category: "pampering",
        description: "When we meet — a relaxing 30-minute massage to melt all your stress away!",
        expiry: "December 31, 2026"
    },
    {
        id: 4, icon: "🏆", title: "Win Any Argument", category: "fun",
        description: "Use this coupon to instantly win any argument. No questions asked!",
        expiry: "March 14, 2026"
    },
    {
        id: 5, icon: "🤗", title: "Unlimited Hugs Day", category: "romantic",
        description: "When we meet — an entire day of unlimited hugs on demand!",
        expiry: "December 31, 2026"
    },
    {
        id: 6, icon: "🍕", title: "Order Anything", category: "food",
        description: "Order any food you want, and I'll pay for it! No budget limits!",
        expiry: "March 31, 2026"
    },
    {
        id: 7, icon: "📱", title: "Full Attention Day", category: "romantic",
        description: "One full day of my complete attention - no phone, no distractions!",
        expiry: "March 14, 2026"
    },
    {
        id: 8, icon: "🎁", title: "Surprise Gift", category: "romantic",
        description: "Redeem for a surprise gift that I'll get you within 48 hours!",
        expiry: "April 30, 2026"
    },
    {
        id: 9, icon: "🎧", title: "Song Dedication", category: "romantic",
        description: "I'll find the perfect song that describes my feelings and send it with a voice note explaining why!",
        expiry: "March 14, 2026"
    },
    {
        id: 10, icon: "😘", title: "100 Kisses", category: "romantic",
        description: "When we meet — exactly 100 kisses delivered throughout the day!",
        expiry: "December 31, 2026"
    },
    {
        id: 11, icon: "📝", title: "Handwritten Love Letter", category: "romantic",
        description: "A handwritten love letter expressing my deepest feelings — mailed to you!",
        expiry: "March 31, 2026"
    },
    {
        id: 12, icon: "👑", title: "Queen for a Day", category: "pampering",
        description: "You're the queen! I'll do whatever you say for an entire day!",
        expiry: "March 14, 2026"
    },
    {
        id: 13, icon: "📞", title: "Midnight Call", category: "romantic",
        description: "I'll stay up and call you at midnight to tell you how much I love you!",
        expiry: "March 14, 2026"
    },
    {
        id: 14, icon: "🌟", title: "Secret Coupon", category: "secret",
        description: "✨ The ULTIMATE coupon ✨\nAsk for ANYTHING. No limits. No rules. This is yours.",
        expiry: "Forever",
        isSecret: true
    }
];

// ============================================
// COUPLES CHALLENGE DECK
// ============================================
export const challengeCards = [
    // Romantic Challenges
    { id: 1, type: "romantic", typeLabel: "💕 Romantic", icon: "😘", challenge: "Give your partner 10 kisses on different parts of their face", description: "Forehead, cheeks, nose, chin... make each one special!" },
    { id: 2, type: "romantic", typeLabel: "💕 Romantic", icon: "🤗", challenge: "Hug for 2 full minutes without letting go", description: "Feel each other's heartbeat and breathe together" },
    { id: 3, type: "romantic", typeLabel: "💕 Romantic", icon: "👀", challenge: "Look into each other's eyes for 60 seconds", description: "No talking, no laughing - just connection" },
    { id: 4, type: "romantic", typeLabel: "💕 Romantic", icon: "💌", challenge: "Write 3 things you love about your partner on their hand", description: "Use your finger to write invisible words of love" },
    { id: 5, type: "romantic", typeLabel: "💕 Romantic", icon: "🌙", challenge: "Slow dance together for one song", description: "Pick your favorite love song and sway together" },

    // Fun Challenges
    { id: 6, type: "fun", typeLabel: "🎉 Fun", icon: "🎭", challenge: "Do your best impression of your partner", description: "Copy their voice, expressions, and mannerisms!" },
    { id: 7, type: "fun", typeLabel: "🎉 Fun", icon: "📸", challenge: "Take the most ridiculous selfie together", description: "The weirder, the better! Make it memorable!" },
    { id: 8, type: "fun", typeLabel: "🎉 Fun", icon: "🎤", challenge: "Sing a love song to your partner", description: "Doesn't matter if you can sing - it's about the effort!" },
    { id: 9, type: "fun", typeLabel: "🎉 Fun", icon: "🕺", challenge: "Create a secret handshake together", description: "Make it at least 10 steps long!" },
    { id: 10, type: "fun", typeLabel: "🎉 Fun", icon: "😂", challenge: "Try to make your partner laugh without touching them", description: "Use jokes, faces, voices - whatever it takes!" },

    // Sweet Challenges
    { id: 11, type: "sweet", typeLabel: "🍬 Sweet", icon: "💭", challenge: "Tell your partner your favorite memory of them", description: "Share the moment that made you fall deeper in love" },
    { id: 12, type: "sweet", typeLabel: "🍬 Sweet", icon: "🌟", challenge: "Compliment your partner 5 different ways", description: "Personality, looks, achievements, habits, anything!" },
    { id: 13, type: "sweet", typeLabel: "🍬 Sweet", icon: "🔮", challenge: "Describe your dream future together", description: "Where do you see yourselves in 10 years?" },
    { id: 14, type: "sweet", typeLabel: "🍬 Sweet", icon: "💝", challenge: "Share something you've never told anyone", description: "A secret, a fear, a dream - something intimate" },
    { id: 15, type: "sweet", typeLabel: "🍬 Sweet", icon: "✨", challenge: "Tell your partner why they're special", description: "What makes them different from everyone else?" },

    // Spicy Challenges
    { id: 16, type: "spicy", typeLabel: "🔥 Spicy", icon: "😘", challenge: "Give your partner a surprise kiss right now", description: "Make it passionate and unexpected!" },
    { id: 17, type: "spicy", typeLabel: "🔥 Spicy", icon: "🌹", challenge: "Whisper something flirty in your partner's ear", description: "Something that'll make them blush!" },
    { id: 18, type: "spicy", typeLabel: "🔥 Spicy", icon: "💫", challenge: "Recreate your first kiss", description: "Try to remember every detail and do it again!" },
    { id: 19, type: "spicy", typeLabel: "🔥 Spicy", icon: "🔥", challenge: "Play with your partner's hair for 2 minutes", description: "Gently, lovingly, romantically..." },
    { id: 20, type: "spicy", typeLabel: "🔥 Spicy", icon: "💕", challenge: "Feed each other something sweet", description: "Could be chocolate, fruit, or dessert!" }
];

// ============================================
// TRUTH OR DARE - COUPLES EDITION
// ============================================
export const truthQuestions = [
    { id: 1, icon: "💭", question: "What was your first impression of me?", hint: "Be honest!", level: "Easy" },
    { id: 2, icon: "💕", question: "When did you first realize you had feelings for me?", hint: "The exact moment if you remember", level: "Easy" },
    { id: 3, icon: "🥺", question: "What's something you were afraid to tell me?", hint: "No judgment zone", level: "Medium" },
    { id: 4, icon: "🌟", question: "What's your favorite physical feature of mine?", hint: "Eyes, smile, hands...?", level: "Easy" },
    { id: 5, icon: "😘", question: "What's your favorite non-physical thing about me?", hint: "Personality, habits, etc.", level: "Easy" },
    { id: 6, icon: "🔮", question: "Where do you see us in 5 years?", hint: "Dream big!", level: "Medium" },
    { id: 7, icon: "😳", question: "Have you ever dreamed about me? What happened?", hint: "Sweet dreams or funny ones!", level: "Medium" },
    { id: 8, icon: "💝", question: "What's something I do that makes your heart flutter?", hint: "The little things count!", level: "Easy" },
    { id: 9, icon: "🥰", question: "What's your favorite memory of us together?", hint: "The more detail, the better", level: "Easy" },
    { id: 10, icon: "😏", question: "What's something you want to try with me but haven't asked?", hint: "Adventure, experience, anything!", level: "Spicy" },
    { id: 11, icon: "💗", question: "What made you fall in love with me?", hint: "The real reason", level: "Deep" },
    { id: 12, icon: "🌙", question: "What do you think about right before falling asleep?", hint: "Honest thoughts only", level: "Medium" },
    { id: 13, icon: "✨", question: "What's one thing you wish I knew about you?", hint: "Something important", level: "Deep" },
    { id: 14, icon: "💫", question: "What's the most romantic thing you've imagined us doing?", hint: "No limits!", level: "Medium" },
    { id: 15, icon: "🦋", question: "Do I still give you butterflies? When?", hint: "Specific moments", level: "Easy" }
];

export const dareQuestions = [
    { id: 1, icon: "📱", question: "Send me a selfie making your cutest face right now!", hint: "No filters needed!", level: "Easy" },
    { id: 2, icon: "😘", question: "Kiss me somewhere you've never kissed before", hint: "Get creative!", level: "Medium" },
    { id: 3, icon: "🎤", question: "Sing a love song for me - full performance!", hint: "Doesn't matter if you can sing!", level: "Fun" },
    { id: 4, icon: "💃", question: "Do your sexiest dance move for 30 seconds", hint: "No embarrassment allowed!", level: "Spicy" },
    { id: 5, icon: "👀", question: "Look into my eyes and say 3 things you love about me", hint: "No breaking eye contact!", level: "Easy" },
    { id: 6, icon: "🤗", question: "Give me the longest, tightest hug ever", hint: "At least 2 minutes!", level: "Easy" },
    { id: 7, icon: "📝", question: "Write 'I love you' somewhere on my body with your finger", hint: "Make me guess where!", level: "Medium" },
    { id: 8, icon: "🎭", question: "Act out how we'll look as an old couple", hint: "Be dramatic!", level: "Fun" },
    { id: 9, icon: "💌", question: "Compose a 4-line poem about me right now", hint: "It doesn't have to rhyme!", level: "Medium" },
    { id: 10, icon: "🌹", question: "Describe our perfect date in detail", hint: "Where, what, how...", level: "Easy" },
    { id: 11, icon: "😘", question: "Give me butterfly kisses for 30 seconds", hint: "With your eyelashes!", level: "Easy" },
    { id: 12, icon: "🔥", question: "Whisper the most romantic thing you can think of in my ear", hint: "Make it memorable!", level: "Spicy" },
    { id: 13, icon: "💕", question: "Post about us on social media right now", hint: "Something sweet!", level: "Medium" },
    { id: 14, icon: "🌙", question: "Describe the dream you'd like to have about us tonight", hint: "Romantic or adventurous!", level: "Medium" },
    { id: 15, icon: "💖", question: "Call me by a new cute nickname for the rest of the day", hint: "Make it unique!", level: "Fun" }
];

// ============================================
// PROMISE JAR SLIPS
// ============================================
export const promiseSlips = [
    { id: 1, icon: "🌅", promise: "I promise to watch every sunrise and sunset with you whenever we can" },
    { id: 2, icon: "🤗", promise: "I promise to always be your safe place to land when life gets hard" },
    { id: 3, icon: "🎯", promise: "I promise to support every dream you have, no matter how big or small" },
    { id: 4, icon: "💪", promise: "I promise to be your biggest cheerleader in everything you do" },
    { id: 5, icon: "🍳", promise: "I promise to make you breakfast in bed at least once a month" },
    { id: 6, icon: "🎁", promise: "I promise to surprise you with thoughtful gifts when you least expect it" },
    { id: 7, icon: "👂", promise: "I promise to always listen to you, even when I'm tired or busy" },
    { id: 8, icon: "🌙", promise: "I promise to never let you fall asleep upset with me" },
    { id: 18, icon: "🤝", promise: "I promise to always choose us, even when it's difficult" },
    { id: 19, icon: "🌟", promise: "I promise to be the best version of myself for you" },
    { id: 20, icon: "♾️", promise: "I promise that my love for you will never fade" }
];

// ============================================
// BUCKET LIST ITEMS
// ============================================
export const bucketListItems = [
    // Travel Adventures
    { id: 1, category: "travel", icon: "🏖️", text: "Watch sunset on a beach together" },
    { id: 2, category: "travel", icon: "🏔️", text: "Go on a mountain hiking trip" },
    { id: 3, category: "travel", icon: "✈️", text: "Take an international trip together" },
    { id: 4, category: "travel", icon: "🚗", text: "Go on a spontaneous road trip" },
    { id: 5, category: "travel", icon: "🏕️", text: "Camp under the stars" },

    // Fun Experiences
    { id: 6, category: "experiences", icon: "🎢", text: "Visit an amusement park together" },
    { id: 7, category: "experiences", icon: "🎬", text: "Have a complete movie marathon day" },
    { id: 8, category: "experiences", icon: "🍳", text: "Take a cooking class together" },
    { id: 9, category: "experiences", icon: "🎨", text: "Do a painting or art class date" },
    { id: 10, category: "experiences", icon: "🎤", text: "Sing karaoke together" },

    // Romantic Moments
    { id: 11, category: "romantic", icon: "🌹", text: "Have a fancy candlelit dinner" },
    { id: 12, category: "romantic", icon: "💃", text: "Take a dance lesson together" },
    { id: 13, category: "romantic", icon: "🌙", text: "Stay up all night talking" },
    { id: 14, category: "romantic", icon: "📸", text: "Do a professional couples photoshoot" },
    { id: 15, category: "romantic", icon: "💌", text: "Write love letters to each other" },

    // Growing Together
    { id: 16, category: "growth", icon: "🏠", text: "Decorate a space together" },
    { id: 17, category: "growth", icon: "🌱", text: "Start a plant or garden together" },
    { id: 18, category: "growth", icon: "📚", text: "Read the same book and discuss it" },
    { id: 19, category: "growth", icon: "🏋️", text: "Work out together for a month" },
    { id: 20, category: "growth", icon: "🎯", text: "Set and achieve a goal together" },

    // Silly Things
    { id: 21, category: "silly", icon: "🛒", text: "Have a shopping cart race" },
    { id: 22, category: "silly", icon: "🎮", text: "Have an all-night gaming session" },
    { id: 23, category: "silly", icon: "🧁", text: "Bake something ridiculous together" },
    { id: 24, category: "silly", icon: "🎭", text: "Dress up for no reason and go out" },
    { id: 25, category: "silly", icon: "📱", text: "Make a TikTok/Reel together" }
];

// ============================================
// SCAVENGER HUNT CLUES
// ============================================
export const scavengerHuntClues = [
    {
        id: 1,
        icon: "🛏️",
        clue: "I hide where dreams take flight each night, where pillows hold our secrets tight...",
        hint: "Check under the pillow or bed!",
        location: "Under the pillow / bed"
    },
    {
        id: 2,
        icon: "📚",
        clue: "Between the pages where stories are told, your next surprise awaits to unfold...",
        hint: "Look inside a favorite book!",
        location: "Inside a book"
    },
    {
        id: 3,
        icon: "🧥",
        clue: "In the place where jackets stay warm, I wait for you in cozy form...",
        hint: "Check a coat pocket or closet!",
        location: "Coat pocket or closet"
    },
    {
        id: 4,
        icon: "❄️",
        clue: "Where cold things live and ice cream dreams, your next clue hides, or so it seems...",
        hint: "Check the fridge or freezer!",
        location: "Refrigerator or freezer"
    },
    {
        id: 5,
        icon: "🪞",
        clue: "Look into the place that shows your face, and find love hiding in this space...",
        hint: "Behind or near a mirror!",
        location: "Near a mirror"
    },
    {
        id: 6,
        icon: "🎁",
        clue: "Congratulations, my love! You found them all! Now come to me for the biggest prize of all! 💕",
        hint: "Come get your prize - ME!",
        location: "Your arms! 🤗"
    }
];

// ============================================
// SCRATCH CARD MESSAGES
// ============================================
export const scratchMessages = [
    { id: 1, icon: "💕", message: "You are the most beautiful person in my world", rarity: "common" },
    { id: 2, icon: "✨", message: "Every moment with you is magical, even through a screen", rarity: "common" },
    { id: 3, icon: "🌙", message: "I dream about you even when I'm awake — you live in my thoughts 24/7", rarity: "common" },
    { id: 4, icon: "💖", message: "My heart beats differently when your name pops up on my phone", rarity: "common" },
    { id: 5, icon: "🌹", message: "You make me want to be the best version of myself — for you, for us", rarity: "common" },
    { id: 6, icon: "🦋", message: "You still give me butterflies every single day. How is that even possible?", rarity: "common" },
    { id: 7, icon: "💫", message: "I fall in love with you more each second — it's honestly unfair", rarity: "common" },
    { id: 8, icon: "🔥", message: "Even across all these miles, you're the fire that keeps my soul warm", rarity: "common" },
    { id: 9, icon: "🌈", message: "You're my sunshine after every storm. I'd be lost in the dark without you.", rarity: "common" },
    { id: 10, icon: "💝", message: "Choosing to wait for you will always be my best decision", rarity: "common" },
    { id: 11, icon: "🌺", message: "Life bloomed when you entered it — before you, everything was black and white", rarity: "rare" },
    { id: 12, icon: "⭐", message: "You're my favorite star in the universe — and I'll spend forever reaching for you", rarity: "rare" },
    { id: 13, icon: "👑", message: "🌟 GOLDEN CARD 🌟\n\nYou found the rarest card! Here's your special reward: I promise to make your FIRST meeting with me the most unforgettable day of your life. Mark my words. ❤️", rarity: "golden" },
];

// ============================================
// TIMELINE / MILESTONES
// ============================================
export const timelineMilestones = [
    {
        id: 1,
        date: "Class 4",
        title: "Where It All Began",
        description: "We met in class 4, two kids who had no idea what the future held 💫",
        icon: "🏫"
    },
    {
        id: 2,
        date: "Class 9",
        title: "Separated By Distance",
        description: "I left the school in class 9 and moved to a new one — but some connections are meant to last.",
        icon: "✈️"
    },
    {
        id: 3,
        date: "After JEE Advanced",
        title: "Found You Again",
        description: "After my JEE Advanced exam, I saw her on Instagram. Something clicked, and I started falling for her all over again 💕",
        icon: "📱"
    },
    {
        id: 4,
        date: "2 Years of Trying",
        title: "Never Gave Up",
        description: "She initially refused, but I never stopped trying. 2 years of patience, hope, and unwavering love 💪",
        icon: "💫"
    },
    {
        id: 5,
        date: "January 12, 2026",
        title: "I Proposed & She Said Yes! 💕",
        description: "The most beautiful day of my life. I finally proposed and she said yes! All the waiting was worth it!",
        icon: "💍"
    },
    {
        id: 6,
        date: "February 7, 2026",
        title: "Our First Rose Day",
        description: "Celebrating our first Valentine's week together as a couple! 🌹",
        icon: "🌹"
    },
    {
        id: 7,
        date: "February 14, 2026",
        title: "First Valentine's Day",
        description: "Our very first Valentine's Day as a couple! Making it unforgettable! ❤️",
        icon: "❤️"
    },
    {
        id: 8,
        date: "The Future",
        title: "Forever Together",
        description: "Every day with you is a new milestone worth celebrating! 💕",
        icon: "🔮"
    }
];

// ============================================
// EASTER EGG SECRETS
// ============================================
export const easterEggMessages = [
    "You found a secret! I love you more than you know! 💕",
    "Hidden message: You're the best thing that ever happened to me! 🥰",
    "Secret unlocked: I think about you 24/7! 💭",
    "Easter egg found: You make my heart do somersaults! 🎪",
    "Secret message: I'm so lucky to have you! 🍀"
];

// Daily Messages based on day of week
export const dailyMessages = {
    0: "Happy Sunday, my love! A perfect day to spend with you! ☀️",
    1: "Monday motivation: You! You're what keeps me going! 💪",
    2: "It's Tuesday! Missing you extra today! 💕",
    3: "Midweek reminder: You're amazing and I love you! 🌟",
    4: "Thursday thoughts: Can't wait to see you! 🥰",
    5: "Finally Friday! Weekend plans with you? 🎉",
    6: "Saturday vibes: Every moment with you is perfect! ✨"
};

// ============================================
// LOVE LANGUAGE TEST
// ============================================
export const loveLanguageQuestions = [
    {
        id: 1,
        question: "After a long, tiring day in our LDR, what would make you happiest?",
        options: [
            { text: "A long voice note telling me how proud they are of me", type: "words" },
            { text: "Them ordering food delivery to my door as a surprise", type: "gifts" },
            { text: "A 2-hour video call just being together", type: "quality" },
            { text: "Them doing something for me I didn't even ask for (like editing my photos)", type: "acts" },
        ]
    },
    {
        id: 2,
        question: "Which gesture from your partner would melt your heart the most?",
        options: [
            { text: "Writing me a long paragraph about why they love me", type: "words" },
            { text: "Planning a virtual movie date with everything ready", type: "quality" },
            { text: "Sending me a surprise care package in the mail", type: "gifts" },
            { text: "Staying up late to help me with something stressful", type: "acts" },
        ]
    },
    {
        id: 3,
        question: "When we finally meet in person, I'd want my partner to...",
        options: [
            { text: "Hug me tight and not let go for 5 minutes", type: "touch" },
            { text: "Look into my eyes and say everything they've been holding back", type: "words" },
            { text: "Have a whole day planned just for us", type: "quality" },
            { text: "Bring a handmade gift or letter they prepared for months", type: "gifts" },
        ]
    },
    {
        id: 4,
        question: "What makes you feel most loved in daily life?",
        options: [
            { text: "Good morning & goodnight texts without fail", type: "words" },
            { text: "Them remembering small things I mentioned and acting on them", type: "acts" },
            { text: "Surprise gifts or recommendations they thought of me for", type: "gifts" },
            { text: "Them making time for me even when they're busy", type: "quality" },
        ]
    },
    {
        id: 5,
        question: "When I'm feeling low, what helps the most?",
        options: [
            { text: "Hearing 'I'm here, I'm not going anywhere'", type: "words" },
            { text: "A surprise video call just to see my face", type: "quality" },
            { text: "Them handling something for me so I don't have to worry", type: "acts" },
            { text: "Receiving something cute — a meme, a drawing, a small gift", type: "gifts" },
        ]
    },
    {
        id: 6,
        question: "What's your dream way to spend a free afternoon together?",
        options: [
            { text: "Deep conversation about our dreams and fears", type: "quality" },
            { text: "Trading compliments and writing love notes to each other", type: "words" },
            { text: "Cuddling on a cozy couch doing absolutely nothing", type: "touch" },
            { text: "Cooking together or doing something as a team", type: "acts" },
        ]
    },
    {
        id: 7,
        question: "What hurts most when your partner forgets to do it?",
        options: [
            { text: "Say 'I love you' or compliment me", type: "words" },
            { text: "Spend dedicated time with just me", type: "quality" },
            { text: "Do something thoughtful without being asked", type: "acts" },
            { text: "Remember special dates or give me small tokens of love", type: "gifts" },
        ]
    },
    {
        id: 8,
        question: "How would you show YOUR love to your partner?",
        options: [
            { text: "Write them poems, letters, and tell them they're beautiful", type: "words" },
            { text: "Plan elaborate surprises and dates", type: "quality" },
            { text: "Buy or make meaningful gifts they'd treasure", type: "gifts" },
            { text: "Take care of their problems, even mundane ones", type: "acts" },
        ]
    },
];

export const loveLanguageResults = {
    words: {
        title: "Words of Affirmation 💌",
        emoji: "💌",
        description: "You feel most loved when your partner expresses their love through words — compliments, love letters, voice notes, and heartfelt messages. In your LDR, those 'I love you' texts aren't just words — they're your lifeline.",
        tip: "Keep sending those long paragraphs! They mean the world to each other. 💕"
    },
    quality: {
        title: "Quality Time ⏰",
        emoji: "⏰",
        description: "Nothing matters more than undivided attention. Video calls, watching movies together, or even comfortable silence on call — being truly PRESENT is your love language. Distance is hard, but your time together is sacred.",
        tip: "Schedule regular date nights — even virtual ones count as real quality time! 🌙"
    },
    gifts: {
        title: "Receiving Gifts 🎁",
        emoji: "🎁",
        description: "It's not about price tags — it's about the thought behind it. A surprise delivery, a handmade letter in the mail, or even a meme that says 'this reminded me of you' makes your heart sing.",
        tip: "Surprise each other with small, thoughtful gestures regularly! 📦"
    },
    acts: {
        title: "Acts of Service 🛠️",
        emoji: "🛠️",
        description: "Actions speak louder than words for you. When your partner goes out of their way to help you, support you, or make your life easier — THAT's when you feel the love deepest.",
        tip: "Show love by solving problems for your partner before they even ask! 💪"
    },
    touch: {
        title: "Physical Touch 🤗",
        emoji: "🤗",
        description: "The hardest love language in an LDR. You crave the warmth of your partner — hugs, holding hands, being close. The anticipation of your first real embrace keeps your heart racing.",
        tip: "Until you meet: send virtual hugs, watch ASMR together, and plan that first hug! 🤗"
    }
};

// ============================================
// COUPLES PLAYLIST
// ============================================
export const playlistSuggestions = [
    { title: "Perfect", artist: "Ed Sheeran", emoji: "💕", mood: "romantic" },
    { title: "All of Me", artist: "John Legend", emoji: "💗", mood: "romantic" },
    { title: "Thinking Out Loud", artist: "Ed Sheeran", emoji: "🎶", mood: "romantic" },
    { title: "A Thousand Years", artist: "Christina Perri", emoji: "⏳", mood: "romantic" },
    { title: "Tum Hi Ho", artist: "Arijit Singh", emoji: "🌹", mood: "bollywood" },
    { title: "Raabta", artist: "Arijit Singh", emoji: "🔗", mood: "bollywood" },
    { title: "Tera Ban Jaunga", artist: "Akhil Sachdeva", emoji: "💍", mood: "bollywood" },
    { title: "Hawayein", artist: "Arijit Singh", emoji: "🌬️", mood: "bollywood" },
    { title: "Pehla Nasha", artist: "Udit Narayan", emoji: "🦋", mood: "bollywood" },
    { title: "Tere Bina", artist: "A.R. Rahman", emoji: "💔", mood: "bollywood" },
    { title: "Photograph", artist: "Ed Sheeran", emoji: "📸", mood: "romantic" },
    { title: "Just the Way You Are", artist: "Bruno Mars", emoji: "✨", mood: "romantic" },
    { title: "Can't Help Falling in Love", artist: "Elvis Presley", emoji: "🎵", mood: "classic" },
    { title: "Make You Feel My Love", artist: "Adele", emoji: "💝", mood: "classic" },
    { title: "Something Just Like This", artist: "Coldplay", emoji: "🌟", mood: "modern" },
    { title: "Lover", artist: "Taylor Swift", emoji: "🏠", mood: "modern" },
];

// ============================================
// DREAM DATE PLANNER
// ============================================
export const dreamDateOptions = {
    locations: [
        { id: 1, icon: "🏖️", label: "Beach at Sunset", vibe: "romantic" },
        { id: 2, icon: "🏔️", label: "Mountain Cabin", vibe: "cozy" },
        { id: 3, icon: "🌃", label: "City Rooftop", vibe: "fancy" },
        { id: 4, icon: "🏠", label: "Cozy Home", vibe: "intimate" },
        { id: 5, icon: "🌸", label: "Cherry Blossom Park", vibe: "dreamy" },
        { id: 6, icon: "🎡", label: "Carnival / Fair", vibe: "fun" },
    ],
    activities: [
        { id: 1, icon: "🍳", label: "Cook Together", vibe: "intimate" },
        { id: 2, icon: "💃", label: "Slow Dance", vibe: "romantic" },
        { id: 3, icon: "🎬", label: "Watch Movie Together", vibe: "cozy" },
        { id: 4, icon: "⭐", label: "Stargazing", vibe: "dreamy" },
        { id: 5, icon: "🎨", label: "Paint Each Other", vibe: "fun" },
        { id: 6, icon: "📸", label: "Photo Walk", vibe: "fun" },
    ],
    foods: [
        { id: 1, icon: "🍕", label: "Pizza & Chill", vibe: "casual" },
        { id: 2, icon: "🍰", label: "Desserts & Sweets", vibe: "sweet" },
        { id: 3, icon: "🍷", label: "Fancy Dinner", vibe: "fancy" },
        { id: 4, icon: "🍜", label: "Street Food", vibe: "adventurous" },
        { id: 5, icon: "☕", label: "Coffee Date", vibe: "cozy" },
        { id: 6, icon: "🍫", label: "Chocolate Fondue", vibe: "romantic" },
    ],
    times: [
        { id: 1, icon: "🌅", label: "Sunrise", vibe: "peaceful" },
        { id: 2, icon: "☀️", label: "Afternoon", vibe: "bright" },
        { id: 3, icon: "🌇", label: "Sunset / Golden Hour", vibe: "romantic" },
        { id: 4, icon: "🌙", label: "Midnight", vibe: "intimate" },
    ],
};

export const dreamDateResponses = [
    "This is literally the perfect date! I can already imagine us there... 💕",
    "Omg YES! Let's add this to our bucket list right now! 📝",
    "You have the most romantic imagination ever. I love you! 😍",
    "I'm saving this. When we finally meet, this is happening! 🤞💕",
    "My heart just skipped a beat imagining this with you... 💗",
];

// ============================================
// LOVE MAP - Meaningful locations
// ============================================
export const loveMapLocations = [
    { id: 1, icon: "📱", title: "Where it all started", description: "Found her on Instagram after JEE Advanced — and my world changed forever", tag: "origin", color: "#ec4899" },
    { id: 2, icon: "💕", title: "Where she lives", description: "Where my heart actually is (because it's with her)", tag: "her", color: "#ef4444" },
    { id: 3, icon: "🏠", title: "Where I live", description: "Where I am, counting days until we meet", tag: "me", color: "#8b5cf6" },
    { id: 4, icon: "💍", title: "Where I proposed", description: "January 12, 2026 — over a call, but felt like she was right here", tag: "proposal", color: "#f59e0b" },
    { id: 5, icon: "✈️", title: "Where we'll meet", description: "The place our LDR becomes real. The most anticipated moment of my life.", tag: "future", color: "#10b981" },
    { id: 6, icon: "🌙", title: "Under the same moon", description: "Wherever we both are, we look at the same sky. That connects us.", tag: "always", color: "#6366f1" },
];

// ============================================
// COUNTDOWN DATA
// ============================================
export const countdownEvents = [
    { id: 1, icon: "🌹", name: "Rose Day", date: "2026-02-07", passed: false },
    { id: 2, icon: "💍", name: "Propose Day", date: "2026-02-08", passed: false },
    { id: 3, icon: "🍫", name: "Chocolate Day", date: "2026-02-09", passed: false },
    { id: 4, icon: "🧸", name: "Teddy Day", date: "2026-02-10", passed: false },
    { id: 5, icon: "🤞", name: "Promise Day", date: "2026-02-11", passed: false },
    { id: 6, icon: "🤗", name: "Hug Day", date: "2026-02-12", passed: false },
    { id: 7, icon: "😘", name: "Kiss Day", date: "2026-02-13", passed: false },
    { id: 8, icon: "❤️", name: "Valentine's Day", date: "2026-02-14", passed: false },
    { id: 9, icon: "💕", name: "1 Month Anniversary", date: "2026-02-12", passed: false },
];
