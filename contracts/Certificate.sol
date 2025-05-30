// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "./CertificateTracker.sol";

/**
 * @title Certificate
 * @dev Контракт отдельного сертификата
 * @dev Представляет один сертификат с возможностью прямой оплаты
 */
contract Certificate {
    /// @dev Цена сертификата в wei
    uint256 public price;
    
    /// @dev Название/описание сертификата
    string public title;
    
    /// @dev Имя преподавателя или автора сертификата
    string public teacher;
    
    /// @dev Флаг, показывающий, был ли сертификат куплен
    bool public purchased;
    
    /// @dev Индекс сертификата в основном контракте-трекере
    uint256 public index;
    
    /// @dev Ссылка на основной контракт-трекер
    CertificateTracker tracker;

    /**
     * @dev Конструктор контракта сертификата
     * @param _price Цена сертификата в wei
     * @param _title Название/описание сертификата
     * @param _index Индекс сертификата в основном контракте
     * @param _teacher Имя преподавателя или автора
     * @param _tracker Адрес основного контракта-трекера
     */
    constructor(uint256 _price, string memory _title, uint256 _index, string memory _teacher, CertificateTracker _tracker) {
        price = _price;
        title = _title;
        index = _index;
        teacher = _teacher;
        tracker = _tracker;
    }

    /**
     * @dev Функция для прямого получения оплаты (receive function)
     * @dev Автоматически вызывается при отправке ETH на адрес контракта
     * @dev Проверяет, что сертификат не куплен и сумма корректна
     * @dev Переадресовывает оплату в основной контракт-трекер
     */
    receive() external payable {
        // Проверяем, что сертификат еще не куплен
        require(purchased == false, "This certificate is already purchased!");
        
        // Проверяем, что отправлена точная сумма
        require(price == msg.value, "We accept only full payments!");

        // Переадресовываем платеж в основной контракт-трекер
        (bool success,) =
            address(tracker).call{value: msg.value}(abi.encodeWithSignature("triggerPayment(uint256)", index));
        require(success, "Sorry, we could not process your transaction.");

        // Помечаем сертификат как купленный
        purchased = true;
    }
}