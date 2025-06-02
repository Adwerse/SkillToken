const { ethers } = require("hardhat");

async function main() {
  console.log("🚀 Начинаем деплой контрактов...\n");

  // Получаем аккаунты
  const [owner, user1] = await ethers.getSigners();
  console.log("👤 Аккаунты:");
  console.log("Владелец (Account #0):", owner.address);
  console.log("Пользователь 1 (Account #1):", user1.address);
  console.log();

  // Деплоим SkillToken
  console.log("📜 Деплой SkillToken контракта...");
  const SkillToken = await ethers.getContractFactory("SkillToken");
  const skillToken = await SkillToken.deploy(owner.address);
  await skillToken.waitForDeployment();
  
  const skillTokenAddress = await skillToken.getAddress();
  console.log("✅ SkillToken задеплоен по адресу:", skillTokenAddress);

  // Деплоим MyNFT
  console.log("\n🎨 Деплой MyNFT контракта...");
  const MyNFT = await ethers.getContractFactory("MyNFT");
  const myNFT = await MyNFT.deploy();
  await myNFT.waitForDeployment();
  
  const nftAddress = await myNFT.getAddress();
  console.log("✅ MyNFT задеплоен по адресу:", nftAddress);

  // Выводим сводку
  console.log("\n" + "=".repeat(60));
  console.log("📋 СВОДКА ДЕПЛОЯ:");
  console.log("=".repeat(60));
  console.log("🌐 Сеть: Hardhat localhost (http://127.0.0.1:8545)");
  console.log("👑 Владелец контрактов:", owner.address);
  console.log();
  console.log("📊 Контракты:");
  console.log("• SkillToken:", skillTokenAddress);
  console.log("• MyNFT:     ", nftAddress);
  console.log();
  console.log("🔧 Настройки для frontend:");
  console.log(`SKILL_TOKEN_ADDRESS = "${skillTokenAddress}"`);
  console.log(`NFT_CONTRACT_ADDRESS = "${nftAddress}"`);
  console.log();
  console.log("💡 Для MetaMask используйте:");
  console.log("• Network: Hardhat (Chain ID: 1337, RPC: http://localhost:8545)");
  console.log("• Account #0 (Владелец):", owner.address);
  console.log("• Account #1 (Пользователь):", user1.address);
  console.log("=".repeat(60));
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Ошибка деплоя:", error);
    process.exit(1);
  }); 