import hre, { ethers } from "hardhat";

async function main() {
  console.log("🚀 SkillToken deployment starting...");
  
  // Получаем аккаунты для деплоя
  const [deployer, owner] = await ethers.getSigners();
  
  console.log("📋 Deploying contracts with the account:", deployer.address);
  console.log("👤 Owner will be:", owner.address);
  console.log("💰 Deployer balance:", ethers.formatEther(await deployer.provider.getBalance(deployer.address)), "ETH");

  // Получаем фабрику контракта SkillToken (исправлено с MusicShop)
  const SkillToken = await ethers.getContractFactory("SkillToken");
  
  console.log("⏳ Deploying SkillToken contract...");
  
  // Деплоим контракт с владельцем
  const skillToken = await SkillToken.deploy(owner.address);
  
  // Ждем подтверждения деплоя
  await skillToken.waitForDeployment();
  
  // Получаем адрес задеплоенного контракта
  const contractAddress = await skillToken.getAddress();
  
  console.log("✅ SkillToken deployed to:", contractAddress);
  console.log("👤 Contract owner:", owner.address);
  console.log("🎉 Deployment completed successfully!");
}

main()
  .then(() => {
    console.log("✨ All done!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  });
