// src/data/mockData.js
export const contracts = Array.from({ length: 50 }, (_, i) => ({
  id: i + 1,
  customerCode: `CUST${String(i + 1).padStart(3, "0")}`,
  ownerName: `Khách hàng ${i + 1}`,
  address: `${123 + i} Đường ${i + 1}, Phường ${(i % 5) + 1}`,
  contractType: i % 3 === 0 ? "Thương mại" : "Hộ gia đình",
  status: ["active", "suspended", "cancelled"][i % 3],
  startDate: `2024-${String((i % 12) + 1).padStart(2, "0")}-${String((i % 28) + 1).padStart(2, "0")}`,
  endDate: null,
  phoneNumber: `+8490${String(i + 1234567).slice(-7)}`,
  email: `customer${i + 1}@email.com`,
  note: `Ghi chú cho hợp đồng ${i + 1}`,
}));

export const contractTypes = [
  { id: 1, name: "Hộ gia đình", contractCount: 150, description: "Dành cho hộ gia đình" },
  { id: 2, name: "Thương mại", contractCount: 45, description: "Dành cho cơ sở kinh doanh" },
  { id: 3, name: "Công nghiệp", contractCount: 12, description: "Dành cho nhà máy, xí nghiệp" },
];

export const pricingTiers = [
  // Cụm 1 - Hiện tại (đang hoạt động)
  {
    id: 1,
    contractTypeId: 1,
    minUsage: 0,
    maxUsage: 10,
    pricePerM3: 5000,
    isActive: true,
    createdAt: "2024-01-01",
    groupId: 1,
  },
  {
    id: 2,
    contractTypeId: 1,
    minUsage: 11,
    maxUsage: 20,
    pricePerM3: 7000,
    isActive: true,
    createdAt: "2024-01-01",
    groupId: 1,
  },
  {
    id: 3,
    contractTypeId: 1,
    minUsage: 21,
    maxUsage: null,
    pricePerM3: 9000,
    isActive: true,
    createdAt: "2024-01-01",
    groupId: 1,
  },

  // Cụm 2 - Cũ (không hoạt động)
  {
    id: 4,
    contractTypeId: 1,
    minUsage: 0,
    maxUsage: 15,
    pricePerM3: 4500,
    isActive: false,
    createdAt: "2023-12-01",
    groupId: 2,
  },
  {
    id: 5,
    contractTypeId: 1,
    minUsage: 16,
    maxUsage: null,
    pricePerM3: 8000,
    isActive: false,
    createdAt: "2023-12-01",
    groupId: 2,
  },

  // Cụm 3 - Thương mại hiện tại
  {
    id: 6,
    contractTypeId: 2,
    minUsage: 0,
    maxUsage: 50,
    pricePerM3: 8000,
    isActive: true,
    createdAt: "2024-01-01",
    groupId: 3,
  },
  {
    id: 7,
    contractTypeId: 2,
    minUsage: 51,
    maxUsage: 100,
    pricePerM3: 10000,
    isActive: true,
    createdAt: "2024-01-01",
    groupId: 3,
  },
  {
    id: 8,
    contractTypeId: 2,
    minUsage: 101,
    maxUsage: null,
    pricePerM3: 15000,
    isActive: true,
    createdAt: "2024-01-01",
    groupId: 3,
  },
];