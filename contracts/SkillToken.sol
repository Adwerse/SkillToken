//SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/utils/introspection/ERC165.sol";
import "hardhat/console.sol";

/**
 * @title SkillToken
 * @dev Контракт для управления сертификатами навыков
 * @dev Позволяет владельцу добавлять сертификаты, а пользователям их покупать
 */
contract SkillToken is ERC165 {
    
    /**
     * @dev Структура сертификата
     * @param index Индекс сертификата в массиве
     * @param uid Уникальный идентификатор сертификата
     * @param title Название сертификата
     * @param description Описание сертификата
     * @param teacher Имя преподавателя или автора
     * @param price Цена сертификата в wei
     * @param quantity Доступное количество сертификатов
     */
    struct Certificate {
        uint256 index;
        bytes32 uid;
        string title;
        string description;
        string teacher;
        uint256 price;
        uint256 quantity;
    }

    /**
     * @dev Структура заказа
     * @param orderId Уникальный идентификатор заказа
     * @param certificateUid Уникальный идентификатор купленного сертификата
     * @param customer Адрес покупателя
     * @param orderedAt Временная метка создания заказа
     * @param status Статус заказа (оплачен/доставлен)
     */
    struct Order {
        uint256 orderId;
        bytes32 certificateUid;
        address customer;
        uint256 orderedAt;
        OrderStatus status;
    }

    /**
     * @dev Перечисление статусов заказа
     * Paid - заказ оплачен, ожидает доставки
     * Delivered - заказ доставлен
     */
    enum OrderStatus {
        Paid,
        Delivered
    }

    /// @dev Массив всех доступных сертификатов
    Certificate[] public certificates;
    
    /// @dev Массив всех заказов
    Order[] public orders;

    /// @dev Текущий индекс для следующего сертификата
    uint256 public currentIndex;
    
    /// @dev Текущий ID для следующего заказа
    uint256 public currentOrderId;

    /// @dev Адрес владельца контракта
    address public owner;

    /**
     * @dev События контракта
     */
    event CertificateBought(bytes32 indexed uid, address indexed customer, uint256 indexed timestamp);
    event CertificateDelivered(bytes32 indexed certificateUid, address indexed customer);

    /**
     * @dev Модификатор для ограничения доступа только владельцу
     */
    modifier onlyOwner() {
        require(msg.sender == owner, "not an owner!");
        _;
    }

    /**
     * @dev Конструктор контракта
     * @param _owner Адрес владельца контракта
     */
    constructor(address _owner) {
        owner = _owner;
    }

    /**
     * @dev Добавляет новый сертификат (только владелец)
     * @param uid Уникальный идентификатор сертификата
     * @param title Название сертификата
     * @param description Описание сертификата
     * @param teacher Имя преподавателя
     * @param price Цена сертификата в wei
     * @param quantity Доступное количество
     */
    function addCertificate(bytes32 uid, string calldata title, string calldata description, string calldata teacher, uint256 price, uint256 quantity) external onlyOwner {
        certificates.push(
            Certificate({
                index: currentIndex,
                uid: uid,
                title: title,
                description: description,
                teacher: teacher,
                price: price,
                quantity: quantity
            })
        );

        currentIndex++;
    }

    /**
     * @dev Покупка сертификата
     * @param _index Индекс сертификата в массиве
     * @dev Требует точной суммы оплаты и наличия сертификатов в наличии
     */
    function buy(uint256 _index) external payable {
        Certificate storage certificateToBuy = certificates[_index];

        // Проверяем, что отправлена правильная сумма
        require(msg.value == certificateToBuy.price, "invalid price");
        
        // Проверяем наличие сертификатов в наличии
        require(certificateToBuy.quantity > 0, "out of stock!");

        // Уменьшаем количество доступных сертификатов
        certificateToBuy.quantity--;

        // Создаем новый заказ
        orders.push(
            Order({
                orderId: currentOrderId,
                certificateUid: certificateToBuy.uid,
                customer: msg.sender,
                orderedAt: block.timestamp,
                status: OrderStatus.Paid
            })
        );

        currentOrderId++;

        // Испускаем событие о покупке
        emit CertificateBought(certificateToBuy.uid, msg.sender, block.timestamp);
    }

    /**
     * @dev Помечает заказ как доставленный (только владелец)
     * @param _index Индекс заказа в массиве
     */
    function delivered(uint256 _index) external onlyOwner {
        Order storage currentOrder = orders[_index];

        // Проверяем, что заказ еще не доставлен
        require(currentOrder.status != OrderStatus.Delivered, "invalid status");

        // Меняем статус на доставлен
        currentOrder.status = OrderStatus.Delivered;

        // Испускаем событие о доставке
        emit CertificateDelivered(currentOrder.certificateUid, currentOrder.customer);
    }

    /**
     * @dev Функция для прямого получения ETH (блокирует прямые переводы)
     */
    receive() external payable {
        revert("Please use the buy function to purchase certificates!");
    }

    /**
     * @dev Возвращает список всех доступных сертификатов
     * @return Массив всех сертификатов
     */
    function allCertificates() external view returns (Certificate[] memory) {
        uint totalCertificates = certificates.length;
        Certificate[] memory certificatesList = new Certificate[](totalCertificates);

        for (uint256 i = 0; i < totalCertificates; ++i) {
            certificatesList[i] = certificates[i];
        }

        return certificatesList;
    }

    /**
     * @dev Fallback функция для отладки
     */
    fallback() external {
        console.logBytes(msg.data);
    }
}