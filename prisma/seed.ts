import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {

  await prisma.userConfiguration.deleteMany();
  await prisma.componentOption.deleteMany();
  await prisma.component.deleteMany();
  await prisma.device.deleteMany();

  const device = await prisma.device.create({
    data: {
      name: "Modular Workstation X",
      slug: "modular-workstation-x",
      basePrice: 899,
      bodyColor: "space-gray"
    }
  });

  const cpu = await prisma.component.create({
    data: {
      name: "CPU",
      key: "cpu",
      description: "Processor options",
      deviceId: device.id
    }
  });

  const ram = await prisma.component.create({
    data: {
      name: "RAM",
      key: "ram",
      description: "Memory options",
      deviceId: device.id
    }
  });

  const storage = await prisma.component.create({
    data: {
      name: "Storage",
      key: "storage",
      description: "SSD storage",
      deviceId: device.id
    }
  });

  await prisma.componentOption.createMany({
    data: [
      { name: "Intel Core i5", priceDelta: 0, perfScore: 20, componentId: cpu.id },
      { name: "Intel Core i7", priceDelta: 180, perfScore: 40, componentId: cpu.id },
      { name: "Intel Core i9", priceDelta: 350, perfScore: 65, componentId: cpu.id },

      { name: "16GB DDR5", priceDelta: 0, perfScore: 10, componentId: ram.id },
      { name: "32GB DDR5", priceDelta: 120, perfScore: 20, componentId: ram.id },
      { name: "64GB DDR5", priceDelta: 260, perfScore: 35, componentId: ram.id },

      { name: "512GB SSD", priceDelta: 0, perfScore: 8, componentId: storage.id },
      { name: "1TB SSD", priceDelta: 100, perfScore: 16, componentId: storage.id },
      { name: "2TB SSD", priceDelta: 220, perfScore: 28, componentId: storage.id }
    ]
  });

  console.log("Seed completed");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });