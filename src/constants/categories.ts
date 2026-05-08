import { Category } from "../types";
import { Ionicons } from "@expo/vector-icons";

// Defining the type for the icon name to ensure type safety with Ionicons
export type IconName = keyof typeof Ionicons.glyphMap;

export const CATEGORIES: Category[] = [
  {
    id: "food",
    name: "Food",
    icon: "fast-food",
    color: "#FF6B6B",
    type: "expense",
  },
  {
    id: "transport",
    name: "Transport",
    icon: "bus",
    color: "#4ECDC4",
    type: "expense",
  },
  {
    id: "airtime",
    name: "Airtime",
    icon: "phone-portrait",
    color: "#45B7D1",
    type: "expense",
  },
  {
    id: "data",
    name: "Data",
    icon: "cellular",
    color: "#96CEB4",
    type: "expense",
  },
  { id: "rent", name: "Rent", icon: "home", color: "#FFEAA7", type: "expense" },
  {
    id: "shopping",
    name: "Shopping",
    icon: "cart",
    color: "#DDA0DD",
    type: "expense",
  },
  {
    id: "utilities",
    name: "Utilities",
    icon: "bulb",
    color: "#F0A500",
    type: "expense",
  },
  {
    id: "health",
    name: "Health",
    icon: "medical",
    color: "#FF8A65",
    type: "expense",
  },
  {
    id: "salary",
    name: "Salary",
    icon: "briefcase",
    color: "#66BB6A",
    type: "income",
  },
  {
    id: "freelance",
    name: "Freelance",
    icon: "laptop",
    color: "#42A5F5",
    type: "income",
  },
  {
    id: "investment",
    name: "Investment",
    icon: "trending-up",
    color: "#AB47BC",
    type: "income",
  },
  { id: "gift", name: "Gift", icon: "gift", color: "#EC407A", type: "income" },
  { id: "other", name: "Other", icon: "apps", color: "#78909C", type: "both" },
];

export const getCategoryById = (id: string): Category | undefined =>
  CATEGORIES.find((c) => c.id === id);
