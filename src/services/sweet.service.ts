import prisma from "../lib/db";

export class SweetService {
  static async createSweet(data: {
    name: string;
    category: string;
    price: number;
    quantity: number;
  }) {
    return prisma.sweet.create({
      data: {
        name: data.name.toLowerCase(),        // lowercase for consistent search
        category: data.category,
        price: data.price,
        quantity: data.quantity,
      },
    });
  }

  static async getAllSweets() {
    return prisma.sweet.findMany({
      orderBy: { createdAt: "desc" },
    });
  }

  static async getSweetById(id: string) {
    return prisma.sweet.findUnique({
      where: { id },
    });
  }

  static async updateSweet(
    id: string,
    data: Partial<{
      name: string;
      category: string;
      price: number;
      quantity: number;
    }>
  ) {
    return prisma.sweet.update({
      where: { id },
      data: {
        name: data.name ? data.name.toLowerCase() : undefined,
        category: data.category,
        price: data.price,
        quantity: data.quantity,
      },
    });
  }

  static async deleteSweet(id: string) {
  // 1️⃣ Delete dependent orders first
  await prisma.order.deleteMany({
    where: { sweetId: id },
  });

  // 2️⃣ Delete the sweet
  return prisma.sweet.delete({
    where: { id },
  });
}


  static async searchSweet(query: {
    name?: string;
    category?: string;
    minPrice?: number;
    maxPrice?: number;
  }) {
    return prisma.sweet.findMany({
      where: {
        AND: [
          // Name search (case-insensitive by lowercasing query & stored values)
          query.name
            ? {
                name: {
                  contains: query.name.toLowerCase(),
                },
              }
            : {},

          // Category filter (exact match)
          query.category
            ? {
                category: query.category,
              }
            : {},

          // Price range
          {
            price: {
              gte: query.minPrice ?? undefined,
              lte: query.maxPrice ?? undefined,
            },
          },
        ],
      },
    });
  }
}
