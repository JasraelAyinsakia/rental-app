import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function fixInventory() {
  console.log('🔍 Checking inventory...\n');

  // Get all mould types
  const moulds = await prisma.mouldType.findMany();

  for (const mould of moulds) {
    // Count how many are currently rented (ACTIVE rentals)
    const rentedItems = await prisma.rentalItem.findMany({
      where: {
        mouldTypeId: mould.id,
        rental: {
          status: 'ACTIVE',
        },
      },
    });

    const totalRented = rentedItems.reduce((sum, item) => sum + item.quantity, 0);
    const correctAvailable = mould.quantity - totalRented;

    console.log(`📦 ${mould.name}:`);
    console.log(`   Total Quantity: ${mould.quantity}`);
    console.log(`   Currently Rented (actual): ${totalRented}`);
    console.log(`   Available (database): ${mould.available}`);
    console.log(`   Available (should be): ${correctAvailable}`);

    // Fix if there's a mismatch
    if (mould.available !== correctAvailable) {
      console.log(`   ⚠️  MISMATCH! Fixing...`);
      await prisma.mouldType.update({
        where: { id: mould.id },
        data: { available: correctAvailable },
      });
      console.log(`   ✅ Fixed!\n`);
    } else {
      console.log(`   ✅ Correct\n`);
    }
  }

  console.log('🎉 Inventory check complete!');
  await prisma.$disconnect();
}

fixInventory().catch((error) => {
  console.error('Error:', error);
  process.exit(1);
});

