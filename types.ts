import { Timestamp } from "firebase/firestore";

export interface Contributor {
  address: string;
  amount: number;
  timestamp: number;
}

export interface Contribution {
  id: string; // Document ID from Firestore
  amount: number;
  contributorAddress: string;
  timestamp: Timestamp; // Firestore server timestamp will be used
}

export interface Wish {
  id: string; // Document ID from Firestore
  creatorAddress: string;
  name: string;
  imageUrl: string;
  targetAmount: number;
  currentAmount: number;
  createdAt?: Timestamp; // Firestore Server Timestamp
  contributors?: Contributor[]; // Add this field
}

// For creating a new wish, we don't have the id etc.
export type NewWish = Omit<
  Wish,
  "id" | "creatorAddress" | "currentAmount" | "createdAt"
>;

export interface PortfolioLink {
  type: "github" | "linkedin" | "twitter" | "website";
  url: string;
}

// Single unified User interface with all properties
export interface User {
  uid: string; // This will be the wallet address
  address: string; // The wallet address (same as uid, for compatibility with Wish functionality)
  displayName: string;
  headline: string;
  pfpUrl: string;
  bio: string;
  skills: string[];
  portfolioLinks: PortfolioLink[];
  following: string[];
  followersCount: number;
}

export interface Idea {
  id: string;
  title: string;
  description: string;
  creatorUid: string;
  creatorInfo: {
    displayName: string;
    pfpUrl: string;
  };
  skillsNeeded: string[];
  status: "recruiting" | "in-progress" | "launched";
  createdAt: Date;
}

export interface ChatMessage {
  id: string;
  senderUid: string;
  text: string;
  timestamp: Date;
}

export interface ChatConversation {
  id: string; // Composite key: uid1_uid2
  participants: [string, string];
  participantInfo: {
    [key: string]: {
      displayName: string;
      pfpUrl: string;
    };
  };
  lastMessage: {
    text: string;
    timestamp: Date;
  };
  messages: ChatMessage[];
}
