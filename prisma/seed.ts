import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()
async function main() {
  const stationary = await prisma.careType.upsert({
    where: { name: 'Stationary' },
    update: {},
    create: {
      id: 1,
      name: 'Stationary',
    },
  })
  const ambulatory = await prisma.careType.upsert({
    where: { name: 'Ambulatory' },
    update: {},
    create: {
      id: 2,
      name: 'Ambulatory',
    },
  })
  const stationary_ambulatory = await prisma.careType.upsert({
    where: { name: 'Stationary & Ambulatory' },
    update: {},
    create: {
      id: 3,
      name: 'Stationary & Ambulatory',
    },
  })
  const dayCare = await prisma.careType.upsert({
    where: { name: 'Day Care' },
    update: {},
    create: {
      id: 4,
      name: 'Day Care',
    },
  })

  const facilityA = await prisma.facility.upsert({
    where: { id: '01A' },
    update: {},
    create: {
      id: '01A',
      name: 'A',
      careTypeId: 1,
      servesCodeMin: 10000,
      servesCodeMax: 14999,
      zipCode: 12000,
      capacity: false,
    },
  })
  const facilityB = await prisma.facility.upsert({
    where: { id: '02B' },
    update: {},
    create: {
      id: '02B',
      name: 'B',
      careTypeId: 1,
      servesCodeMin: 15000,
      servesCodeMax: 19999,
      zipCode: 17000,
      capacity: true,
    },
  })
  const facilityC = await prisma.facility.upsert({
    where: { id: '03C' },
    update: {},
    create: {
      id: '03C',
      name: 'C',
      careTypeId: 2,
      servesCodeMin: 20000,
      servesCodeMax: 24999,
      zipCode: 22000,
      capacity: false,
    },
  })
  const facilityD = await prisma.facility.upsert({
    where: { id: '04D' },
    update: {},
    create: {
      id: '04D',
      name: 'D',
      careTypeId: 2,
      servesCodeMin: 25000,
      servesCodeMax: 29999,
      zipCode: 27000,
      capacity: true,
    },
  })
  const facilityE = await prisma.facility.upsert({
    where: { id: '05E' },
    update: {},
    create: {
      id: '05E',
      name: 'E',
      careTypeId: 3,
      servesCodeMin: 10000,
      servesCodeMax: 24999,
      zipCode: 18000,
      capacity: true,
    },
  })
  console.log({ stationary, ambulatory, stationary_ambulatory, dayCare })
}
main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })