import prisma from "@/lib/db";

export class InventoryService {
  static async purchaseSweet(
    sweetId: string,
    quantity: number,
    user: any
  ) {
    // 🔐 Fetch full user from DB (CRITICAL FIX)
    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
    });

    if (!dbUser) {
      throw new Error("User not found");
    }

    const sweet = await prisma.sweet.findUnique({
      where: { id: sweetId },
    });

    if (!sweet) {
      throw new Error("Sweet not found");
    }

    if (quantity <= 0) {
      throw new Error("Invalid quantity");
    }

    if (sweet.quantity < quantity) {
      throw new Error("Insufficient stock");
    }

    let updatedSweet;

    await prisma.$transaction(async (tx) => {
      // ✅ EXISTING STOCK UPDATE (UNCHANGED)
      updatedSweet = await tx.sweet.update({
        where: { id: sweetId },
        data: {
          quantity: sweet.quantity - quantity,
        },
      });

      // ✅ ORDER HISTORY (NOW SAFE & CORRECT)
      await tx.order.create({
        data: {
          userId: dbUser.id,
          sweetId: sweet.id,

          userName: dbUser.name,
          userEmail: dbUser.email,
          userRole: dbUser.role,

          sweetName: sweet.name,
          sweetCategory: sweet.category,
          pricePerUnit: sweet.price,

          quantity,
          totalPrice: sweet.price * quantity,
        },
      });
    });

    return updatedSweet;
  }
}
