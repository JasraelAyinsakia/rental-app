import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const mouldTypes = [
  'Ashlar 8',
  'Indiana',
  'European fan',
  'Tile mart 1',
  'Ashler',
  'Ashlar Bold',
  'Ashler bold C',
  'Royal Ashler Bold 1',
  'Stone',
  'Stone/flower rock',
  'Big couble',
  'Square Ashlar',
  'Compass',
  'Y wood',
  'Royal ashler B2',
  'Double bold Wood',
  'London Couble stone',
];

async function main() {
  console.log('🌱 Starting seed...');

  // Create default admin user
  const hashedPassword = await bcrypt.hash('Jasrael38', 10);
  
  const admin = await prisma.user.upsert({
    where: { email: 'apuseyinejake011@gmail.com' },
    update: {
      password: hashedPassword,
      role: 'ADMIN',
    },
    create: {
      email: 'apuseyinejake011@gmail.com',
      name: 'Admin User',
      password: hashedPassword,
      role: 'ADMIN',
    },
  });

  console.log('✅ Created admin user:', admin.email);
  console.log('📧 Email: apuseyinejake011@gmail.com');
  console.log('🔑 Password: Jasrael38');

  // Create mould types
  for (const mouldName of mouldTypes) {
    await prisma.mouldType.upsert({
      where: { name: mouldName },
      update: {},
      create: {
        name: mouldName,
        quantity: 0, // Start with no inventory
        available: 0, // Start with no inventory
      },
    });
  }

  console.log(`✅ Created ${mouldTypes.length} mould types`);

  console.log('🎉 Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

