import { LoanName, PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function seedDatabase() {
  async function seedSavingsType() {
    await prisma.savingCategory.create({
      data: {
        name: "Quick Savings",
        type: "QUICK",
        interestRate: 0,
      },
    });

    await prisma.savingCategory.create({
      data: {
        name: "Cooperative Savings",
        type: "COOPERATIVE",
        interestRate: 5.0,
      },
    });
  }

  async function seedLoanType() {
    const loanCategories = [
      {
        name: LoanName.REGULAR,
        description:
          "Regular loan with flexible terms. Interest rate varies by duration: 5% for up to 12 months, 7% for more than 12 months.",
        interestRate: null,
        minAmount: null,
        maxAmount: null,
        minDuration: null,
        maxDuration: null,
        isActive: true,
      },
    ];

    for (const category of loanCategories) {
      await prisma.loanCategory.upsert({
        where: { name: category.name },
        update: category,
        create: category,
      });
      console.log(`✓ Loan category "${category.name}" seeded`);
    }
  }

  async function main() {
    // await seedLoanType();
    // await seedSavingsType();
    console.log("Seeding completed for selected tables");
  }

  main()
    .catch((e) => {
      console.error(e);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}

seedDatabase();
