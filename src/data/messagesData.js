// Mock conversations for the Inbox page
export const mockConversations = [
  {
    id: 1,
    customerId: 1,
    lastMessage: "Perfect! See you Saturday at 2 PM",
    lastMessageTime: "2025-11-28T15:45:00",
    unreadCount: 0,
    status: 'open',
    isRead: true,
  },
  {
    id: 2,
    customerId: 2,
    lastMessage: "Can you send me an estimate for the repairs?",
    lastMessageTime: "2025-11-28T14:20:00",
    unreadCount: 1,
    status: 'unread',
    isRead: false,
  },
  {
    id: 3,
    customerId: 3,
    lastMessage: "Thanks for the great service!",
    lastMessageTime: "2025-11-28T11:30:00",
    unreadCount: 0,
    status: 'open',
    isRead: true,
  },
  {
    id: 4,
    customerId: 4,
    lastMessage: "I sent a quote to your email",
    lastMessageTime: "2025-11-27T16:10:00",
    unreadCount: 2,
    status: 'unread',
    isRead: false,
  },
  {
    id: 5,
    customerId: 5,
    lastMessage: "Will the new filter reduce the algae?",
    lastMessageTime: "2025-11-27T13:45:00",
    unreadCount: 0,
    status: 'unresponded',
    isRead: true,
  },
  {
    id: 6,
    customerId: 6,
    lastMessage: "Your monthly maintenance is due",
    lastMessageTime: "2025-11-27T09:20:00",
    unreadCount: 0,
    status: 'unresponded',
    isRead: true,
  },
  {
    id: 7,
    customerId: 7,
    lastMessage: "Available Tuesday or Wednesday?",
    lastMessageTime: "2025-11-26T17:55:00",
    unreadCount: 0,
    status: 'open',
    isRead: true,
  },
  {
    id: 8,
    customerId: 8,
    lastMessage: "My pump is making a strange noise",
    lastMessageTime: "2025-11-26T14:30:00",
    unreadCount: 3,
    status: 'unresponded',
    isRead: true,
  },
  {
    id: 9,
    customerId: 9,
    lastMessage: "Thanks for fixing the heater so quickly!",
    lastMessageTime: "2025-11-26T10:15:00",
    unreadCount: 0,
    status: 'open',
    isRead: true,
  },
  {
    id: 10,
    customerId: 10,
    lastMessage: "Do you still offer drain cleaning services?",
    lastMessageTime: "2025-11-25T16:40:00",
    unreadCount: 0,
    status: 'unresponded',
    isRead: true,
  },
  {
    id: 11,
    customerId: 11,
    lastMessage: "Looking forward to the upgrade next week",
    lastMessageTime: "2025-11-25T12:05:00",
    unreadCount: 0,
    status: 'open',
    isRead: true,
  },
  {
    id: 12,
    customerId: 12,
    lastMessage: "Can you help me choose the right equipment?",
    lastMessageTime: "2025-11-24T15:30:00",
    unreadCount: 1,
    status: 'unresponded',
    isRead: true,
  },
]

// Mock messages for conversations
export const mockMessages = [
  // Conversation 1 - Jones T
  {
    id: 1,
    conversationId: 1,
    senderType: 'customer',
    content: "Hi! I need my pool cleaned before the weekend party",
    timestamp: "2025-11-28T10:00:00",
  },
  {
    id: 2,
    conversationId: 1,
    senderType: 'business',
    content: "We can help! We have availability Friday at 10 AM or Saturday at 2 PM. Which works better?",
    timestamp: "2025-11-28T10:15:00",
  },
  {
    id: 3,
    conversationId: 1,
    senderType: 'customer',
    content: "Perfect! See you Saturday at 2 PM",
    timestamp: "2025-11-28T15:45:00",
  },

  // Conversation 2 - Rohan
  {
    id: 4,
    conversationId: 2,
    senderType: 'customer',
    content: "Hi, I'm interested in your pool maintenance service",
    timestamp: "2025-11-27T09:30:00",
  },
  {
    id: 5,
    conversationId: 2,
    senderType: 'business',
    content: "Great! We offer weekly, bi-weekly, and monthly maintenance plans. What's your preference?",
    timestamp: "2025-11-27T10:00:00",
  },
  {
    id: 6,
    conversationId: 2,
    senderType: 'customer',
    content: "Weekly sounds good. Can you send me an estimate for the repairs?",
    timestamp: "2025-11-28T14:20:00",
  },

  // Conversation 3 - Pallavi Vaidya
  {
    id: 7,
    conversationId: 3,
    senderType: 'business',
    content: "Your quarterly service is complete! Filter replaced and chemicals balanced",
    timestamp: "2025-11-28T08:30:00",
  },
  {
    id: 8,
    conversationId: 3,
    senderType: 'customer',
    content: "Thanks for the great service!",
    timestamp: "2025-11-28T11:30:00",
  },

  // Conversation 4 - Ana Dolorit
  {
    id: 9,
    conversationId: 4,
    senderType: 'customer',
    content: "Hi, is it possible to get a quote for a new pool pump?",
    timestamp: "2025-11-26T14:00:00",
  },
  {
    id: 10,
    conversationId: 4,
    senderType: 'business',
    content: "Of course! What's your current pump size and any specific requirements?",
    timestamp: "2025-11-26T14:30:00",
  },
  {
    id: 11,
    conversationId: 4,
    senderType: 'customer',
    content: "1.5 HP, variable speed would be nice for energy savings",
    timestamp: "2025-11-26T15:15:00",
  },
  {
    id: 12,
    conversationId: 4,
    senderType: 'business',
    content: "I sent a quote to your email",
    timestamp: "2025-11-27T16:10:00",
  },

  // Conversation 5 - Mary Beddard
  {
    id: 13,
    conversationId: 5,
    senderType: 'customer',
    content: "Hi, I'm noticing some algae building up. What should I do?",
    timestamp: "2025-11-25T13:00:00",
  },
  {
    id: 14,
    conversationId: 5,
    senderType: 'business',
    content: "We can do a full chemical treatment this week. A new filter can also help prevent algae growth",
    timestamp: "2025-11-25T13:30:00",
  },
  {
    id: 15,
    conversationId: 5,
    senderType: 'customer',
    content: "Will the new filter reduce the algae?",
    timestamp: "2025-11-27T13:45:00",
  },

  // Conversation 6 - Katherine Buckley
  {
    id: 16,
    conversationId: 6,
    senderType: 'business',
    content: "Hello Katherine, your monthly maintenance is due this week",
    timestamp: "2025-11-26T08:00:00",
  },
  {
    id: 17,
    conversationId: 6,
    senderType: 'business',
    content: "Would Tuesday or Thursday work better for you?",
    timestamp: "2025-11-27T09:20:00",
  },

  // Conversation 7 - David Nickerson
  {
    id: 18,
    conversationId: 7,
    senderType: 'customer',
    content: "The pool heater stopped working. Can you help?",
    timestamp: "2025-11-25T15:00:00",
  },
  {
    id: 19,
    conversationId: 7,
    senderType: 'business',
    content: "Sorry to hear that! We have a technician available. Available Tuesday or Wednesday?",
    timestamp: "2025-11-26T17:55:00",
  },

  // Conversation 8 - Tatiana Pressau
  {
    id: 20,
    conversationId: 8,
    senderType: 'customer',
    content: "My pump is making a strange noise",
    timestamp: "2025-11-24T16:20:00",
  },
  {
    id: 21,
    conversationId: 8,
    senderType: 'customer',
    content: "Should I be concerned?",
    timestamp: "2025-11-26T14:30:00",
  },

  // Conversation 9 - Sarah Johnson
  {
    id: 22,
    conversationId: 9,
    senderType: 'business',
    content: "Hi Sarah! Your heater is now repaired and running smoothly",
    timestamp: "2025-11-25T09:00:00",
  },
  {
    id: 23,
    conversationId: 9,
    senderType: 'customer',
    content: "Thanks for fixing the heater so quickly!",
    timestamp: "2025-11-26T10:15:00",
  },

  // Conversation 10 - Michael Chen
  {
    id: 24,
    conversationId: 10,
    senderType: 'customer',
    content: "Do you still offer drain cleaning services?",
    timestamp: "2025-11-23T14:00:00",
  },

  // Conversation 11 - Lisa Rodriguez
  {
    id: 25,
    conversationId: 11,
    senderType: 'business',
    content: "Hi Lisa! We're scheduling installations for next week. Your upgrade is confirmed for Tuesday 10 AM",
    timestamp: "2025-11-24T10:30:00",
  },
  {
    id: 26,
    conversationId: 11,
    senderType: 'customer',
    content: "Looking forward to the upgrade next week",
    timestamp: "2025-11-25T12:05:00",
  },

  // Conversation 12 - James Wilson
  {
    id: 27,
    conversationId: 12,
    senderType: 'customer',
    content: "Hi, I'm new to pool ownership. Can you help me choose the right equipment?",
    timestamp: "2025-11-22T11:00:00",
  },
  {
    id: 28,
    conversationId: 12,
    senderType: 'customer',
    content: "I'm not sure what size pump or filter I need",
    timestamp: "2025-11-24T15:30:00",
  },
]
