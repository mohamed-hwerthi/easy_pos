import { Guest, RestaurantTable } from "@/lib/table";

const createGuests = (
  count: number,
  paidPattern: boolean[],
  amounts: number[]
): Guest[] => {
  return Array.from({ length: count }, (_, i) => ({
    id: `guest-${Date.now()}-${Math.random().toString(36).substr(2, 9)}-${i}`,
    name: `Client ${i + 1}`,
    amountDue: amounts[i] ?? Math.floor(Math.random() * 30 + 15),
    paid: paidPattern[i] ?? false,
  }));
};

export const mockTables: RestaurantTable[] = [
  {
    id: "1",
    name: "Table",
    number: 1,
    status: "unpaid",
    guests: createGuests(4, [false, false, false, false], [22, 18, 25, 22.5]),
    qrCode: "TABLE-001",
    lastUpdated: new Date(),
  },
  {
    id: "2",
    name: "Table",
    number: 2,
    status: "paid",
    guests: createGuests(2, [true, true], [35, 28]),
    qrCode: "TABLE-002",
    lastUpdated: new Date(),
  },
  {
    id: "3",
    name: "Table",
    number: 3,
    status: "empty",
    guests: [],
    qrCode: "TABLE-003",
    lastUpdated: new Date(),
  },
  {
    id: "4",
    name: "Table",
    number: 4,
    status: "partial",
    guests: createGuests(
      6,
      [true, true, false, false, false, false],
      [26, 28, 24, 30, 22, 26]
    ),
    qrCode: "TABLE-004",
    lastUpdated: new Date(),
  },
  {
    id: "5",
    name: "Table",
    number: 5,
    status: "paid",
    guests: createGuests(3, [true, true, true], [45, 32, 38]),
    qrCode: "TABLE-005",
    lastUpdated: new Date(),
  },
  {
    id: "6",
    name: "Table",
    number: 6,
    status: "partial",
    guests: createGuests(2, [true, false], [21, 21.8]),
    qrCode: "TABLE-006",
    lastUpdated: new Date(),
  },
  {
    id: "7",
    name: "Terrasse",
    number: 1,
    status: "empty",
    guests: [],
    qrCode: "TERR-001",
    lastUpdated: new Date(),
  },
  {
    id: "8",
    name: "Terrasse",
    number: 2,
    status: "paid",
    guests: createGuests(4, [true, true, true, true], [28, 32, 26, 30]),
    qrCode: "TERR-002",
    lastUpdated: new Date(),
  },
  {
    id: "9",
    name: "Bar",
    number: 1,
    status: "unpaid",
    guests: createGuests(1, [false], [18.5]),
    qrCode: "BAR-001",
    lastUpdated: new Date(),
  },
  {
    id: "10",
    name: "VIP",
    number: 1,
    status: "partial",
    guests: createGuests(
      8,
      [true, true, true, false, false, false, false, false],
      [40, 45, 38, 42, 48, 35, 40, 32]
    ),
    qrCode: "VIP-001",
    lastUpdated: new Date(),
  },
  {
    id: "11",
    name: "Table",
    number: 7,
    status: "empty",
    guests: [],
    qrCode: "TABLE-007",
    lastUpdated: new Date(),
  },
  {
    id: "12",
    name: "Table",
    number: 8,
    status: "paid",
    guests: createGuests(2, [true, true], [24, 28]),
    qrCode: "TABLE-008",
    lastUpdated: new Date(),
  },
];
