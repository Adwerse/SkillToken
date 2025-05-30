// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "./Certificate.sol";

/**
 * @title CertificateTracker
 * @dev Контракт для отслеживания жизненного цикла сертификатов
 * @dev Управляет созданием, оплатой и доставкой сертификатов
 */
contract CertificateTracker is Ownable {
    
    /**
     * @dev Перечисление состояний сертификата
     * Created - сертификат создан, но не оплачен
     * Paid - сертификат оплачен, ожидает доставки
     * Delivered - сертификат доставлен
     */
    enum CertificateState {
        Created,
        Paid,
        Delivered
    }

    /**
     * @dev Структура продукта сертификата
     * @param certificate Ссылка на контракт сертификата
     * @param state Текущее состояние сертификата
     * @param price Цена сертификата в wei
     * @param title Название/описание сертификата
     */
    struct CertificateProduct {
        Certificate certificate;
        CertificateState state;
        uint256 price;
        string title;
    }

    /**
     * @dev Событие изменения состояния сертификата
     * @param _certificateaddress Адрес контракта сертификата
     * @param _certificateIndex Индекс сертификата в маппинге
     * @param _stateNum Номер нового состояния (0=Created, 1=Paid, 2=Delivered)
     */
    event CertificateStateChanged(address indexed _certificateaddress, uint256 _certificateIndex, uint256 _stateNum);

    /// @dev Маппинг для хранения всех сертификатов по их индексу
    mapping(uint256 => CertificateProduct) public certificates;
    
    /// @dev Текущий индекс для следующего сертификата
    uint256 public currentIndex;

    /**
     * @dev Конструктор контракта
     * @dev Устанавливает владельца контракта как отправителя транзакции
     */
    constructor() Ownable(msg.sender) {}

    /**
     * @dev Создает новый сертификат
     * @param _price Цена сертификата в wei
     * @param _title Название/описание сертификата
     * @param _teacher Имя преподавателя или автора сертификата
     */
    function createCertificate(uint256 _price, string memory _title, string memory _teacher) public {
        // Создаем новый контракт сертификата
        Certificate newCertificate = new Certificate(_price, _title, currentIndex, _teacher, this);

        // Сохраняем информацию о сертификате
        certificates[currentIndex].certificate = newCertificate;
        certificates[currentIndex].state = CertificateState.Created;
        certificates[currentIndex].price = _price;
        certificates[currentIndex].title = _title;

        // Испускаем событие о создании сертификата
        emit CertificateStateChanged(address(newCertificate), currentIndex, uint256(certificates[currentIndex].state));

        // Увеличиваем индекс для следующего сертификата
        currentIndex++;
    }

    /**
     * @dev Обрабатывает оплату сертификата
     * @param _index Индекс сертификата для оплаты
     * @dev Требует точной суммы оплаты
     */
    function triggerPayment(uint256 _index) public payable {
        require(certificates[_index].state == CertificateState.Created, "This certificate is already purchased!");
        require(certificates[_index].price == msg.value, "We accept only full payments!");

        // Изменяем состояние на "Оплачено"
        certificates[_index].state = CertificateState.Paid;

        // Испускаем событие об изменении состояния
        emit CertificateStateChanged(address(certificates[_index].certificate), _index, uint256(certificates[_index].state));
    }

    /**
     * @dev Обрабатывает доставку сертификата (только владелец)
     * @param _index Индекс сертификата для доставки
     * @dev Может вызывать только владелец контракта
     */
    function triggerDelivery(uint256 _index) public onlyOwner {
        require(certificates[_index].state == CertificateState.Paid, "This certificate is not paid for!");

        // Изменяем состояние на "Доставлено"
        certificates[_index].state = CertificateState.Delivered;

        // Испускаем событие об изменении состояния
        emit CertificateStateChanged(address(certificates[_index].certificate), _index, uint256(certificates[_index].state));
    }
}