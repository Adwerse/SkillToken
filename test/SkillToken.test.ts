import {
  time,
  loadFixture,
} from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { anyValue } from "@nomicfoundation/hardhat-chai-matchers/withArgs";
import { expect } from "chai";
import { ethers } from "hardhat";
import { SkillToken } from "../typechain-types/contracts";

describe("SkillToken", function () {
  // Фикстура для деплоя контракта
  async function deploySkillTokenFixture() {
    const [owner, buyer, buyer2, notOwner] = await ethers.getSigners();

    const SkillToken = await ethers.getContractFactory("SkillToken");
    const skillToken = await SkillToken.deploy(owner.address) as SkillToken;

    return { skillToken, owner, buyer, buyer2, notOwner };
  }

  // Фикстура с уже добавленным сертификатом
  async function deployWithCertificateFixture() {
    const { skillToken, owner, buyer, buyer2, notOwner } = await loadFixture(deploySkillTokenFixture);

    const uid = ethers.keccak256(ethers.toUtf8Bytes("test-cert-1"));
    const title = "JavaScript Основы";
    const description = "Курс по основам JavaScript";
    const teacher = "Иван Иванов";
    const price = ethers.parseEther("0.1");
    const quantity = 10;

    await skillToken.connect(owner).addCertificate(uid, title, description, teacher, price, quantity);

    return { skillToken, owner, buyer, buyer2, notOwner, uid, title, description, teacher, price, quantity };
  }

  describe("Деплой", function () {
    it("Должен правильно установить владельца", async function () {
      const { skillToken, owner } = await loadFixture(deploySkillTokenFixture);

      expect(await skillToken.owner()).to.equal(owner.address);
    });

    it("Должен инициализировать currentIndex как 0", async function () {
      const { skillToken } = await loadFixture(deploySkillTokenFixture);

      expect(await skillToken.currentIndex()).to.equal(0);
    });

    it("Должен инициализировать currentOrderId как 0", async function () {
      const { skillToken } = await loadFixture(deploySkillTokenFixture);

      expect(await skillToken.currentOrderId()).to.equal(0);
    });

    it("Должен поддерживать ERC165", async function () {
      const { skillToken } = await loadFixture(deploySkillTokenFixture);

      // ERC165 interface ID
      expect(await skillToken.supportsInterface("0x01ffc9a7")).to.be.true;
    });
  });

  describe("Добавление сертификатов", function () {
    describe("Успешные случаи", function () {
      it("Должен позволить владельцу добавить сертификат", async function () {
        const { skillToken, owner } = await loadFixture(deploySkillTokenFixture);

        const uid = ethers.keccak256(ethers.toUtf8Bytes("test-cert"));
        const title = "Python Основы";
        const description = "Курс по основам Python";
        const teacher = "Анна Петрова";
        const price = ethers.parseEther("0.2");
        const quantity = 5;

        await skillToken.connect(owner).addCertificate(uid, title, description, teacher, price, quantity);

        const certificate = await skillToken.certificates(0);
        expect(certificate.index).to.equal(0);
        expect(certificate.uid).to.equal(uid);
        expect(certificate.title).to.equal(title);
        expect(certificate.description).to.equal(description);
        expect(certificate.teacher).to.equal(teacher);
        expect(certificate.price).to.equal(price);
        expect(certificate.quantity).to.equal(quantity);
      });

      it("Должен увеличивать currentIndex после добавления", async function () {
        const { skillToken, owner } = await loadFixture(deploySkillTokenFixture);

        const uid1 = ethers.keccak256(ethers.toUtf8Bytes("cert-1"));
        const uid2 = ethers.keccak256(ethers.toUtf8Bytes("cert-2"));

        await skillToken.connect(owner).addCertificate(uid1, "Title 1", "Desc 1", "Teacher 1", 100, 5);
        expect(await skillToken.currentIndex()).to.equal(1);

        await skillToken.connect(owner).addCertificate(uid2, "Title 2", "Desc 2", "Teacher 2", 200, 3);
        expect(await skillToken.currentIndex()).to.equal(2);
      });

      it("Должен добавлять множественные сертификаты с правильными индексами", async function () {
        const { skillToken, owner } = await loadFixture(deploySkillTokenFixture);

        const uid1 = ethers.keccak256(ethers.toUtf8Bytes("cert-1"));
        const uid2 = ethers.keccak256(ethers.toUtf8Bytes("cert-2"));
        const uid3 = ethers.keccak256(ethers.toUtf8Bytes("cert-3"));

        await skillToken.connect(owner).addCertificate(uid1, "Title 1", "Desc 1", "Teacher 1", 100, 5);
        await skillToken.connect(owner).addCertificate(uid2, "Title 2", "Desc 2", "Teacher 2", 200, 3);
        await skillToken.connect(owner).addCertificate(uid3, "Title 3", "Desc 3", "Teacher 3", 300, 1);

        const cert1 = await skillToken.certificates(0);
        const cert2 = await skillToken.certificates(1);
        const cert3 = await skillToken.certificates(2);

        expect(cert1.index).to.equal(0);
        expect(cert2.index).to.equal(1);
        expect(cert3.index).to.equal(2);
      });
    });

    describe("Ограничения доступа", function () {
      it("Не должен позволить НЕ-владельцу добавить сертификат", async function () {
        const { skillToken, notOwner } = await loadFixture(deploySkillTokenFixture);

        const uid = ethers.keccak256(ethers.toUtf8Bytes("test-cert"));

        await expect(
          skillToken.connect(notOwner).addCertificate(uid, "Title", "Desc", "Teacher", 100, 5)
        ).to.be.revertedWith("not an owner!");
      });
    });
  });

  describe("Покупка сертификатов", function () {
    describe("Успешные случаи", function () {
      it("Должен позволить купить сертификат с правильной ценой", async function () {
        const { skillToken, buyer, uid, price } = await loadFixture(deployWithCertificateFixture);

        await expect(
          skillToken.connect(buyer).buy(0, { value: price })
        ).to.not.be.reverted;
      });

      it("Должен уменьшить количество доступных сертификатов", async function () {
        const { skillToken, buyer, price, quantity } = await loadFixture(deployWithCertificateFixture);

        await skillToken.connect(buyer).buy(0, { value: price });

        const certificate = await skillToken.certificates(0);
        expect(certificate.quantity).to.equal(quantity - 1);
      });

      it("Должен создать заказ с правильными данными", async function () {
        const { skillToken, buyer, uid, price } = await loadFixture(deployWithCertificateFixture);

        const beforeTimestamp = await time.latest();
        await skillToken.connect(buyer).buy(0, { value: price });
        const afterTimestamp = await time.latest();

        const order = await skillToken.orders(0);
        expect(order.orderId).to.equal(0);
        expect(order.certificateUid).to.equal(uid);
        expect(order.customer).to.equal(buyer.address);
        expect(order.orderedAt).to.be.at.least(beforeTimestamp);
        expect(order.orderedAt).to.be.at.most(afterTimestamp);
        expect(order.status).to.equal(0); // OrderStatus.Paid
      });

      it("Должен испускать событие CertificateBought", async function () {
        const { skillToken, buyer, uid, price } = await loadFixture(deployWithCertificateFixture);

        await expect(
          skillToken.connect(buyer).buy(0, { value: price })
        ).to.emit(skillToken, "CertificateBought")
         .withArgs(uid, buyer.address, anyValue);
      });

      it("Должен увеличивать currentOrderId", async function () {
        const { skillToken, buyer, buyer2, price } = await loadFixture(deployWithCertificateFixture);

        await skillToken.connect(buyer).buy(0, { value: price });
        expect(await skillToken.currentOrderId()).to.equal(1);

        await skillToken.connect(buyer2).buy(0, { value: price });
        expect(await skillToken.currentOrderId()).to.equal(2);
      });

      it("Должен позволить купить последний доступный сертификат", async function () {
        const { skillToken, owner, buyer } = await loadFixture(deploySkillTokenFixture);

        const uid = ethers.keccak256(ethers.toUtf8Bytes("last-cert"));
        const price = ethers.parseEther("0.1");
        
        // Добавляем сертификат с количеством 1
        await skillToken.connect(owner).addCertificate(uid, "Last Cert", "Desc", "Teacher", price, 1);

        await expect(
          skillToken.connect(buyer).buy(0, { value: price })
        ).to.not.be.reverted;

        const certificate = await skillToken.certificates(0);
        expect(certificate.quantity).to.equal(0);
      });
    });

    describe("Ошибки валидации", function () {
      it("Должен отклонить покупку с неправильной ценой (слишком мало)", async function () {
        const { skillToken, buyer, price } = await loadFixture(deployWithCertificateFixture);

        const wrongPrice = price - 1n;

        await expect(
          skillToken.connect(buyer).buy(0, { value: wrongPrice })
        ).to.be.revertedWith("invalid price");
      });

      it("Должен отклонить покупку с неправильной ценой (слишком много)", async function () {
        const { skillToken, buyer, price } = await loadFixture(deployWithCertificateFixture);

        const wrongPrice = price + 1n;

        await expect(
          skillToken.connect(buyer).buy(0, { value: wrongPrice })
        ).to.be.revertedWith("invalid price");
      });

      it("Должен отклонить покупку если нет в наличии", async function () {
        const { skillToken, owner, buyer } = await loadFixture(deploySkillTokenFixture);

        const uid = ethers.keccak256(ethers.toUtf8Bytes("out-of-stock"));
        const price = ethers.parseEther("0.1");
        
        // Добавляем сертификат с количеством 0
        await skillToken.connect(owner).addCertificate(uid, "Out of Stock", "Desc", "Teacher", price, 0);

        await expect(
          skillToken.connect(buyer).buy(0, { value: price })
        ).to.be.revertedWith("out of stock!");
      });

      it("Должен отклонить покупку несуществующего сертификата", async function () {
        const { skillToken, buyer } = await loadFixture(deploySkillTokenFixture);

        await expect(
          skillToken.connect(buyer).buy(0, { value: 100 })
        ).to.be.reverted; // Попытка доступа к несуществующему индексу
      });

      it("Должен отклонить повторную покупку когда закончились сертификаты", async function () {
        const { skillToken, owner, buyer, buyer2 } = await loadFixture(deploySkillTokenFixture);

        const uid = ethers.keccak256(ethers.toUtf8Bytes("single-cert"));
        const price = ethers.parseEther("0.1");
        
        // Добавляем сертификат с количеством 1
        await skillToken.connect(owner).addCertificate(uid, "Single Cert", "Desc", "Teacher", price, 1);

        // Первая покупка должна пройти
        await skillToken.connect(buyer).buy(0, { value: price });

        // Вторая покупка должна быть отклонена
        await expect(
          skillToken.connect(buyer2).buy(0, { value: price })
        ).to.be.revertedWith("out of stock!");
      });
    });
  });

  describe("Доставка заказов", function () {
    describe("Успешные случаи", function () {
      it("Должен позволить владельцу пометить заказ как доставленный", async function () {
        const { skillToken, owner, buyer, price } = await loadFixture(deployWithCertificateFixture);

        // Покупаем сертификат
        await skillToken.connect(buyer).buy(0, { value: price });

        // Помечаем как доставленный
        await skillToken.connect(owner).delivered(0);

        const order = await skillToken.orders(0);
        expect(order.status).to.equal(1); // OrderStatus.Delivered
      });

      it("Должен испускать событие CertificateDelivered", async function () {
        const { skillToken, owner, buyer, uid, price } = await loadFixture(deployWithCertificateFixture);

        // Покупаем сертификат
        await skillToken.connect(buyer).buy(0, { value: price });

        // Помечаем как доставленный
        await expect(
          skillToken.connect(owner).delivered(0)
        ).to.emit(skillToken, "CertificateDelivered")
         .withArgs(uid, buyer.address);
      });
    });

    describe("Ограничения доступа", function () {
      it("Не должен позволить НЕ-владельцу пометить заказ как доставленный", async function () {
        const { skillToken, notOwner, buyer, price } = await loadFixture(deployWithCertificateFixture);

        // Покупаем сертификат
        await skillToken.connect(buyer).buy(0, { value: price });

        // Попытка пометить как доставленный НЕ-владельцем
        await expect(
          skillToken.connect(notOwner).delivered(0)
        ).to.be.revertedWith("not an owner!");
      });
    });

    describe("Ошибки валидации", function () {
      it("Должен отклонить попытку доставить уже доставленный заказ", async function () {
        const { skillToken, owner, buyer, price } = await loadFixture(deployWithCertificateFixture);

        // Покупаем сертификат
        await skillToken.connect(buyer).buy(0, { value: price });

        // Первая доставка
        await skillToken.connect(owner).delivered(0);

        // Вторая попытка доставки
        await expect(
          skillToken.connect(owner).delivered(0)
        ).to.be.revertedWith("invalid status");
      });

      it("Должен отклонить доставку несуществующего заказа", async function () {
        const { skillToken, owner } = await loadFixture(deployWithCertificateFixture);

        await expect(
          skillToken.connect(owner).delivered(0)
        ).to.be.reverted; // Попытка доступа к несуществующему заказу
      });
    });
  });

  describe("Получение списка сертификатов", function () {
    it("Должен возвращать пустой массив если нет сертификатов", async function () {
      const { skillToken } = await loadFixture(deploySkillTokenFixture);

      const certificates = await skillToken.allCertificates();
      expect(certificates).to.have.length(0);
    });

    it("Должен возвращать все сертификаты", async function () {
      const { skillToken, owner } = await loadFixture(deploySkillTokenFixture);

      const uid1 = ethers.keccak256(ethers.toUtf8Bytes("cert-1"));
      const uid2 = ethers.keccak256(ethers.toUtf8Bytes("cert-2"));

      await skillToken.connect(owner).addCertificate(uid1, "Title 1", "Desc 1", "Teacher 1", 100, 5);
      await skillToken.connect(owner).addCertificate(uid2, "Title 2", "Desc 2", "Teacher 2", 200, 3);

      const certificates = await skillToken.allCertificates();
      expect(certificates).to.have.length(2);
      expect(certificates[0].uid).to.equal(uid1);
      expect(certificates[1].uid).to.equal(uid2);
    });

    it("Должен возвращать актуальные количества после покупок", async function () {
      const { skillToken, buyer, price, quantity } = await loadFixture(deployWithCertificateFixture);

      // Покупаем один сертификат
      await skillToken.connect(buyer).buy(0, { value: price });

      const certificates = await skillToken.allCertificates();
      expect(certificates[0].quantity).to.equal(quantity - 1);
    });
  });

  describe("Прямые переводы ETH", function () {
    it("Должен отклонить прямые переводы через receive()", async function () {
      const { skillToken, buyer } = await loadFixture(deploySkillTokenFixture);

      await expect(
        buyer.sendTransaction({
          to: await skillToken.getAddress(),
          value: ethers.parseEther("0.1")
        })
      ).to.be.revertedWith("Please use the buy function to purchase certificates!");
    });

    it("Должен отклонить переводы с пустыми данными", async function () {
      const { skillToken, buyer } = await loadFixture(deploySkillTokenFixture);

      await expect(
        buyer.sendTransaction({
          to: await skillToken.getAddress(),
          value: ethers.parseEther("0.1"),
          data: "0x"
        })
      ).to.be.revertedWith("Please use the buy function to purchase certificates!");
    });
  });

  describe("Fallback функция", function () {
    it("Должен обрабатывать вызовы с данными через fallback", async function () {
      const { skillToken, buyer } = await loadFixture(deploySkillTokenFixture);

      // Вызов несуществующей функции должен попасть в fallback
      await expect(
        buyer.sendTransaction({
          to: await skillToken.getAddress(),
          data: "0x12345678"
        })
      ).to.not.be.reverted;
    });
  });

  describe("Интеграционные тесты", function () {
    it("Должен правильно обрабатывать полный цикл: добавление -> покупка -> доставка", async function () {
      const { skillToken, owner, buyer } = await loadFixture(deploySkillTokenFixture);

      const uid = ethers.keccak256(ethers.toUtf8Bytes("integration-test"));
      const title = "Интеграционный тест";
      const description = "Полный цикл тестирования";
      const teacher = "Тестовый преподаватель";
      const price = ethers.parseEther("0.5");
      const quantity = 3;

      // 1. Добавляем сертификат
      await skillToken.connect(owner).addCertificate(uid, title, description, teacher, price, quantity);

      // 2. Покупаем сертификат
      await expect(
        skillToken.connect(buyer).buy(0, { value: price })
      ).to.emit(skillToken, "CertificateBought")
       .withArgs(uid, buyer.address, anyValue);

      // 3. Проверяем состояние после покупки
      const certificate = await skillToken.certificates(0);
      expect(certificate.quantity).to.equal(quantity - 1);

      const order = await skillToken.orders(0);
      expect(order.certificateUid).to.equal(uid);
      expect(order.customer).to.equal(buyer.address);
      expect(order.status).to.equal(0); // Paid

      // 4. Доставляем заказ
      await expect(
        skillToken.connect(owner).delivered(0)
      ).to.emit(skillToken, "CertificateDelivered")
       .withArgs(uid, buyer.address);

      // 5. Проверяем финальное состояние
      const finalOrder = await skillToken.orders(0);
      expect(finalOrder.status).to.equal(1); // Delivered
    });

    it("Должен правильно обрабатывать множественные покупки и доставки", async function () {
      const { skillToken, owner, buyer, buyer2 } = await loadFixture(deploySkillTokenFixture);

      const uid = ethers.keccak256(ethers.toUtf8Bytes("multi-test"));
      const price = ethers.parseEther("0.1");
      const quantity = 5;

      // Добавляем сертификат
      await skillToken.connect(owner).addCertificate(uid, "Multi Test", "Desc", "Teacher", price, quantity);

      // Первая покупка
      await skillToken.connect(buyer).buy(0, { value: price });
      
      // Вторая покупка
      await skillToken.connect(buyer2).buy(0, { value: price });

      // Проверяем количество
      const certificate = await skillToken.certificates(0);
      expect(certificate.quantity).to.equal(quantity - 2);

      // Проверяем заказы
      expect(await skillToken.currentOrderId()).to.equal(2);

      const order1 = await skillToken.orders(0);
      const order2 = await skillToken.orders(1);

      expect(order1.customer).to.equal(buyer.address);
      expect(order2.customer).to.equal(buyer2.address);

      // Доставляем первый заказ
      await skillToken.connect(owner).delivered(0);
      
      // Доставляем второй заказ
      await skillToken.connect(owner).delivered(1);

      // Проверяем статусы
      const finalOrder1 = await skillToken.orders(0);
      const finalOrder2 = await skillToken.orders(1);

      expect(finalOrder1.status).to.equal(1); // Delivered
      expect(finalOrder2.status).to.equal(1); // Delivered
    });
  });

  describe("Граничные случаи", function () {
    it("Должен обрабатывать сертификаты с нулевой ценой", async function () {
      const { skillToken, owner, buyer } = await loadFixture(deploySkillTokenFixture);

      const uid = ethers.keccak256(ethers.toUtf8Bytes("free-cert"));
      const price = 0;

      await skillToken.connect(owner).addCertificate(uid, "Free Cert", "Desc", "Teacher", price, 1);

      await expect(
        skillToken.connect(buyer).buy(0, { value: price })
      ).to.not.be.reverted;
    });

    it("Должен обрабатывать очень высокие цены", async function () {
      const { skillToken, owner, buyer } = await loadFixture(deploySkillTokenFixture);

      const uid = ethers.keccak256(ethers.toUtf8Bytes("expensive-cert"));
      const price = ethers.parseEther("1000");

      await skillToken.connect(owner).addCertificate(uid, "Expensive Cert", "Desc", "Teacher", price, 1);

      await expect(
        skillToken.connect(buyer).buy(0, { value: price })
      ).to.not.be.reverted;
    });

    it("Должен обрабатывать большие количества сертификатов", async function () {
      const { skillToken, owner } = await loadFixture(deploySkillTokenFixture);

      const uid = ethers.keccak256(ethers.toUtf8Bytes("bulk-cert"));
      const quantity = 1000000;

      await skillToken.connect(owner).addCertificate(uid, "Bulk Cert", "Desc", "Teacher", 100, quantity);

      const certificate = await skillToken.certificates(0);
      expect(certificate.quantity).to.equal(quantity);
    });

    it("Должен обрабатывать пустые строки в данных сертификата", async function () {
      const { skillToken, owner } = await loadFixture(deploySkillTokenFixture);

      const uid = ethers.keccak256(ethers.toUtf8Bytes("empty-strings"));

      await expect(
        skillToken.connect(owner).addCertificate(uid, "", "", "", 100, 1)
      ).to.not.be.reverted;

      const certificate = await skillToken.certificates(0);
      expect(certificate.title).to.equal("");
      expect(certificate.description).to.equal("");
      expect(certificate.teacher).to.equal("");
    });
  });
}); 