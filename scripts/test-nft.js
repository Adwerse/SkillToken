const { ethers } = require("hardhat");

async function main() {
  const contractAddress = "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512";
  
  // Подключаемся к задеплоенному контракту
  const MyNFT = await ethers.getContractFactory("MyNFT");
  const myNFT = MyNFT.attach(contractAddress);
  
  const [owner, user1] = await ethers.getSigners();
  
  console.log("=== Тестирование MyNFT контракта ===");
  console.log("Адрес контракта:", contractAddress);
  console.log("Владелец контракта:", owner.address);
  console.log("Тестовый пользователь:", user1.address);
  
  // Проверяем начальное состояние
  const totalSupply = await myNFT.totalSupply();
  console.log("Начальное общее количество токенов:", totalSupply.toString());
  
  // Минтим NFT для пользователя
  console.log("\n=== Минтинг NFT ===");
  const tokenURI = "https://example.com/nft/1.json";
  
  const tx = await myNFT.mintToAddress(user1.address, tokenURI);
  const receipt = await tx.wait();
  
  console.log("NFT заминчен! Hash транзакции:", tx.hash);
  
  // Проверяем результат
  const newTotalSupply = await myNFT.totalSupply();
  console.log("Новое общее количество токенов:", newTotalSupply.toString());
  
  const ownerOfToken = await myNFT.ownerOf(0);
  console.log("Владелец токена #0:", ownerOfToken);
  
  const tokenURIResult = await myNFT.tokenURI(0);
  console.log("URI токена #0:", tokenURIResult);
  
  const userBalance = await myNFT.balanceOf(user1.address);
  console.log("Баланс пользователя:", userBalance.toString());
  
  // Получаем все токены пользователя
  const userTokens = await myNFT.getTokensOfOwner(user1.address);
  console.log("Токены пользователя:", userTokens.map(id => id.toString()));
  
  console.log("\n✅ Контракт работает корректно!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Ошибка:", error);
    process.exit(1);
  }); 