document.addEventListener('DOMContentLoaded', () => {


  /* -- Переменные используемые в различных частях кода -- */
  let currentClientIndex;
  const form = document.querySelector('.form__group');
  const list = document.getElementById('clientsItems');
  const API_BASE_URL = 'http://localhost:3000/api/clients';
  const CONTACT_TYPES = ['Телефон', 'Email', 'Vk', 'Facebook', 'Другое'];
  const EMPTY_RESULT_COUNT = 0;
  const SEARCH_DELAY_MS = 300;
  const DROPDOWN_DEFAULT_INDEX = 0;
  const EMPTY_VALUE = 0;
  const MIN_LENGHT_SYMBOLS = 2;

  loadClients();
  /* -- Конец объявления переменных -- */

  /* -- Функции работы с данными -- */

  /* Загрузка окна клиента по ссылке */

  // Проверка хэша при загрузке страницы
   const hash = window.location.hash;
   if (hash.startsWith('#client-')) {
     const clientId = hash.split('-')[1];
     console.log(clientId);
     openChangeClientModal(clientId);
   };

   // Открытие модального окна изменения клиента с заданным ID
  async function openChangeClientModal(clientId) {
    const data = await loadClientData(clientId); // Функция загрузки данных клиента по ID
    populateChangeClientModal(data); // Функция для заполнения модального окна данными клиента
    openModal(modalChange, `#client-${clientId}`);
  }

  // Функция для загрузки данных клиента
  async function loadClientData(clientId) {
    try {
      const response = await fetch(`${API_BASE_URL}/${clientId}`);
      if (!response.ok) {
        throw new Error('Ошибка при загрузке данных клиента');
      }
      return await response.json();
    } catch (error) {
        console.error('Ошибка:', error);
        return null;
      }
  }

  //************************************/

  // Основная функция, вызываемая для заполнения модального окна
  function populateChangeClientModal(clientData) {
    if (!clientData) return;

    populateClientInfo(clientData);
    clearContactsList();
    populateContacts(clientData.contacts);
  }

  // Функция для заполнения основной информации о клиенте
  function populateClientInfo(clientData) {
    document.getElementById('surnameChange').value = clientData.surname;
    document.getElementById('nameChange').value = clientData.name;
    document.getElementById('lastnameChange').value = clientData.lastName;
    document.getElementById('idChange').innerHTML = "ID: " + clientData.id;
  }

  // Функция для очистки списка контактов
  function clearContactsList() {
    const contactsList = document.querySelector('.contacts__list--change');
    contactsList.innerHTML = '';
  }

  // Функция для заполнения списка контактов
  function populateContacts(contacts) {
    const contactsList = document.querySelector('.contacts__list--change');

    contacts.forEach(contact => {
        const contactElement = createContactElement(contact);
        contactsList.appendChild(contactElement);
    });
  }

  // Функция для создания элемента контакта
  function createContactElement(contact) {
    const clientContactWrapper = createElement('div', 'contact__wrapper flex', '');

    const clientContactType = createDropdown(contact.type);
    const clientContact = createContactInput(contact.value);
    const deleteButton = createDeleteButton(clientContactWrapper);

    clientContactWrapper.appendChild(clientContactType);
    clientContactWrapper.appendChild(clientContact);
    clientContactWrapper.appendChild(deleteButton);

    return clientContactWrapper;
  }

  // Функция для создания выпадающего списка типа контакта
  function createDropdown(selectedType) {
    const options = CONTACT_TYPES;

    const clientContactType = document.createElement('div');
    clientContactType.classList.add('dropdown__wrapper');

    const dropdownButton = document.createElement('div');
    dropdownButton.classList.add('dropdown__button', 'type');
    dropdownButton.textContent = selectedType;
    clientContactType.appendChild(dropdownButton);

    const dropdownList = document.createElement('ul');
    dropdownList.classList.add('dropdown__list');
    clientContactType.appendChild(dropdownList);

    options.forEach(option => {
        const listItem = document.createElement('li');
        listItem.classList.add('dropdown__item');
        listItem.textContent = option;
        listItem.addEventListener('click', () => {
            dropdownButton.textContent = option;
            dropdownList.classList.remove('show');
        });
        dropdownList.appendChild(listItem);
    });

    dropdownButton.addEventListener('click', () => {
        dropdownList.classList.toggle('show');
        dropdownButton.classList.toggle('open');
    });

    return clientContactType;
  }

  // Функция для создания текстового ввода для контакта
  function createContactInput(value) {
    const clientContact = createElement('input', 'contact contact__input', '');
    clientContact.placeholder = 'Введите данные контакта';
    clientContact.value = value;
    return clientContact;
  }

  // Функция для создания кнопки удаления контакта
  function createDeleteButton(contactWrapper) {
    const deleteButton = document.createElement('button');
    deleteButton.classList.add('contact__delete');

    const deleteButtonHint = createElement('div', 'button__hint', 'Удалить контакт');
    deleteButton.appendChild(deleteButtonHint);

    deleteButton.style.display = 'inline-block';
    deleteButton.addEventListener('click', () => {
        contactWrapper.remove();
    });

    return deleteButton;
  }

  //************************************/


  function openModal(modal, hash) {
    modal.classList.add('show');
    window.location.hash = hash;
  }

  /* Функция загрузки клиентов из базы данных */
  async function loadClients() {
    try {
      const response = await fetch(`${API_BASE_URL}`, {
        method: 'GET',
      });

      if (!response.ok) {
        throw new Error('Ошибка загрузки данных');
      }

      const data = await response.json();
      console.log('Загруженные данные:', data); // логирование данных

      list.innerHTML = ''; // очищаем список перед загрузкой новых данных
      data.forEach(addClientsToList);
      return data;
    } catch (error) {
      console.error('Ошибка при загрузке студентов:', error);
    }
  }

    //************************************/
  //Функция создания клиентов
  // Функция обработки отправки формы
  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const contactsWrapper = document.querySelectorAll('.contact__wrapper');
    const errorAdd = document.getElementById('errorModalAdd');
    const surnameInput = document.getElementById('surnameAdd');
    const nameInput = document.getElementById('nameAdd');
    const lastnameInput = document.getElementById('lastnameAdd');

    const surname = capitalizeFirstLetter(surnameInput.value.trim());
    const name = capitalizeFirstLetter(nameInput.value.trim());
    const lastname = capitalizeFirstLetter(lastnameInput.value.trim());

    try {
      validateName(surname, name, lastname, surnameInput, nameInput, lastnameInput, errorAdd);
        const contacts = validateContacts(contactsWrapper, errorAdd);
        await submitClientData({ surname, name, lastName: lastname, contacts });
        resetFormAndUI(contactsWrapper);
    } catch (error) {
        handleFormError(error, errorAdd);
    }
  });

  // Функция для отправки данных клиента на сервер
  async function submitClientData(clientData) {
    const response = await fetch(`${API_BASE_URL}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(clientData),
    });

    if (!response.ok) {
        throw new Error('Ошибка добавления данных');
    }

    const data = await response.json();
    await addClientsToList(data);
  }

  // Функция для очистки формы и интерфейса после отправки данных
  function resetFormAndUI(contactsWrapper) {
    document.getElementById('surnameAdd').value = '';
    document.getElementById('nameAdd').value = '';
    document.getElementById('lastnameAdd').value = '';
    document.getElementById('errorModalAdd').style.display = 'none';

    contactsWrapper.forEach(contactWrapper => {
        contactWrapper.querySelector('.contact').value = '';
    });

    const modalAddClient = document.getElementById('modalWindowAdd');
    modalAddClient.classList.remove('show');
    removeActiveStatus();
    removeEmptyContacts();
  }

  // Функция для обработки ошибок формы
  function handleFormError(error, errorAdd) {
    errorAdd.textContent = `Ошибка: ${error.message}`;
    errorAdd.style.display = 'block';
    console.error('Ошибка:', error);
  }

  //************************************/

  /* Функция удаления клиентов */
  async function deleteClient(id) {
    try {
      const response = await fetch(`${API_BASE_URL}/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Ошибка удаления данных');
      }

      const data = await response.json();
      if (data && data.message === 'Client deleted successfully') {
        list.innerHTML = ''; // очищаем список перед загрузкой новых данных
        loadClients();
      }
    } catch (error) {
      console.error('Ошибка при удалении студента:', error);
    }
    loadClients();
  }

   //************************************/
/* Функция изменения клиента */

 // Функция для изменения данных клиента
  async function changeClient() {
    const id = extractClientId();
    const { surname, name, lastname } = getClientNameInputs();
    const errorChange = document.getElementById('errorModalChange');
    const contactsWrapper = document.querySelectorAll('.contacts__list--change .contact__wrapper');

    clearInputErrors();

    try {
        validateClientData(surname, name, lastname, errorChange);
        const updatedContacts = validateContacts(contactsWrapper, errorChange);
        await updateClientData(id, { surname, name, lastName: lastname, contacts: updatedContacts });
        closeChangeModal();
        loadClients();

    } catch (error) {
        handleFormError(error, errorChange);
    }
  }

  // Функция для извлечения ID клиента
  function extractClientId() {
    const idElement = document.getElementById('idChange');
    if (!idElement) {
        throw new Error('Не удалось найти элемент с ID клиента');
    }
    return idElement.innerHTML.split(' ')[1];
  }

  // Функция для получения значений имени, фамилии и отчества клиента
  function getClientNameInputs() {
    const surnameInput = document.getElementById('surnameChange');
    const nameInput = document.getElementById('nameChange');
    const lastnameInput = document.getElementById('lastnameChange');

    if (!surnameInput || !nameInput || !lastnameInput) {
        throw new Error('Не удалось найти один или несколько полей для имени, фамилии или отчества');
    }

    return {
        surname: capitalizeFirstLetter(surnameInput.value.trim()),
        name: capitalizeFirstLetter(nameInput.value.trim()),
        lastname: capitalizeFirstLetter(lastnameInput.value.trim())
    };
  }

  // Функция для очистки ошибок ввода
  function clearInputErrors() {
    const inputs = ['surnameChange', 'nameChange', 'lastnameChange'].map(id => document.getElementById(id));

    inputs.forEach(input => {
        if (input) input.classList.remove('input--error');
    });
  }

  // Функция для отправки обновленных данных клиента на сервер
  async function updateClientData(id, clientData) {
    const response = await fetch(`${API_BASE_URL}/${id}`, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(clientData),
    });

    if (!response.ok) {
        throw new Error('Ошибка при обновлении данных');
    }
  }

  // Функция для закрытия модального окна изменения клиента
  function closeChangeModal() {
    const modalChange = document.getElementById("modalWindowChange");
    if (!modalChange) {
        throw new Error('Не удалось найти модальное окно для изменения клиента');
    }
    modalChange.classList.remove('show');
    clearContactInputs();
  }

  // Функция для обработки ошибок формы
  function handleFormError(error, errorElement) {
    console.error('Ошибка при обновлении данных:', error);
    if (errorElement) {
        errorElement.textContent = `Ошибка: ${error.message}`;
        errorElement.style.display = 'block';
    }
  }

  // Функция для проверки данных клиента
  function validateClientData(surname, name, lastname, errorElement) {
    validateName(surname, name, lastname,
        document.getElementById('surnameChange'),
        document.getElementById('nameChange'),
        document.getElementById('lastnameChange'),
        errorElement);
  }

  function clearContactInputs() {
    const contactsWrapper = document.querySelector('.contacts__list--change');
    if (contactsWrapper) {
        contactsWrapper.innerHTML = ''; // Очищаем все добавленные контакты
    }
}

   //************************************/

  /* Функция задержки поиска */
  function delaySearch(func, delay) {
    let timeoutId;
    return function(...args) {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => func.apply(this, args), delay);
    };
  }

 // Функция для поиска клиента на сервере
  async function searchClient() {
    const searchInput = document.getElementById('search').value; // Получаем значение из Input

    try {
      const response = await fetch(`${API_BASE_URL}?search=${searchInput}`, {
        method: 'GET',
      });

      if (!response.ok) {
        throw new Error('Ошибка поиска клиента');
      }
      const data = await response.json();

      if (data.length === EMPTY_RESULT_COUNT) {
        // Если клиенты не найдены, выводим сообщение об этом на страницу
        const noResultsMessage = document.getElementById('noResultsMessage');
        noResultsMessage.style.display = 'block';
        list.innerHTML = '';
      } else {
        // Если клиенты найдены, скрываем сообщение об отсутствии результатов
        const noResultsMessage = document.getElementById('noResultsMessage');
        noResultsMessage.style.display = 'none';

        // Очищаем список перед загрузкой новых данных
        list.innerHTML = '';
        // Добавляем найденных клиентов на страницу
        data.forEach(addClientsToList);
      }

    } catch (error) {
      console.error('Ошибка при поиске клиента:', error);
    }
  }

  const delaydSearchClient = delaySearch(searchClient, SEARCH_DELAY_MS);

  const searchInput = document.getElementById('search');
  searchInput.addEventListener('input', delaydSearchClient);


  /* -- Универсальные функции -- */
  function createElement(tagName, className, textContent) {
    const tag = document.createElement(tagName);
    tag.classList.add(className);
    tag.innerHTML = textContent;
    return tag;
  }

/************************************/
function createContactInput(modalElement, container, containerSelector, buttonSelector) {
  const clientContactWrapper = createContactWrapper();
  const clientContactType = createDropdown(CONTACT_TYPES);
  const clientContact = createContactInputField();
  const deleteButton = createDeleteButton(() => handleDeleteContact(clientContactWrapper, modalElement, containerSelector, buttonSelector));

  setupContactInputEvents(clientContact, deleteButton);

  clientContactWrapper.appendChild(clientContactType);
  clientContactWrapper.appendChild(clientContact);
  clientContactWrapper.appendChild(deleteButton);
  container.appendChild(clientContactWrapper);

  checkContactsCount(modalElement, containerSelector, buttonSelector);
}

function createContactWrapper() {
  const wrapper = createElement('div', 'contact__wrapper', '');
  wrapper.classList.add('flex');
  return wrapper;
}

function createDropdown(options) {
  const dropdownWrapper = document.createElement('div');
  dropdownWrapper.classList.add('dropdown__wrapper');

  const dropdownButton = document.createElement('div');
  dropdownButton.classList.add('dropdown__button', 'type');
  dropdownButton.textContent = options[DROPDOWN_DEFAULT_INDEX]; // Первое значение по умолчанию
  dropdownWrapper.appendChild(dropdownButton);

  const dropdownList = document.createElement('ul');
  dropdownList.classList.add('dropdown__list');
  dropdownWrapper.appendChild(dropdownList);

  options.forEach(option => {
    const listItem = createElement('li', 'dropdown__item', option);
    listItem.addEventListener('click', () => {
      dropdownButton.textContent = option;
      dropdownList.classList.remove('show');
    });
    dropdownList.appendChild(listItem);
  });

  dropdownButton.addEventListener('click', () => {
    dropdownList.classList.toggle('show');
    dropdownButton.classList.toggle('open');
  });

  return dropdownWrapper;
}

function createContactInputField() {
  const input = createElement('input', 'contact', '');
  input.placeholder = 'Введите данные контакта';
  return input;
}

function createDeleteButton(onClick) {
  const deleteButton = document.createElement('button');
  deleteButton.classList.add('contact__delete');
  const deleteButtonHint = createElement('div', 'button__hint', 'Удалить контакт');
  deleteButton.appendChild(deleteButtonHint);
  deleteButton.style.display = 'none'; // Скрываем кнопку удаления по умолчанию
  deleteButton.addEventListener('click', onClick);
  return deleteButton;
}

function setupContactInputEvents(clientContact, deleteButton) {
  clientContact.addEventListener('input', function () {
    if (this.value.trim() !== '') {
      deleteButton.style.display = 'inline-block';
      clientContact.classList.add('contact__input');
      clientContact.style.borderRight = 'none';
    } else {
      clientContact.classList.remove('contact__input');
      clientContact.style.borderRight = '1px solid var(--txt-grey)';
      deleteButton.style.display = 'none';
    }
  });
}

function handleDeleteContact(wrapper, modalElement, containerSelector, buttonSelector) {
  wrapper.remove();
  checkContactsCount(modalElement, containerSelector, buttonSelector);
}

//************************************/
// Функция для удаления пустых contact__wrapper

  function removeContacts(modal) {
    const contactsWrapper = modal.querySelectorAll('.contact__wrapper');
    contactsWrapper.forEach(contactWrapper => {
      const contactInput = contactWrapper.querySelector('.contact');
      if (contactInput.value.trim() === '') {
        contactWrapper.remove();
      }
    });
  }

  function clearInput(inputElement, errorElement) {
    inputElement.value = '';
    inputElement.classList.remove('input--error');
    errorElement.style.display = 'none';
  }

  function completionPlaceholders(modalContainer) {
    const inputs = modalContainer.querySelectorAll('input');

    inputs.forEach(input => {
      const placeholder = input.previousElementSibling;

      input.addEventListener('focus', () => {
        placeholder.classList.add('active');
      });

      input.addEventListener('blur', () => {
        if (input.value === '') {
          placeholder.classList.remove('active');
        }
      });
    });
  }

  // Функция для преобразования первой буквы каждого слова в верхний регистр
  function capitalizeFirstLetter(str) {
    const words = str.split(' ');
    const capitalizedWords = words.map(word => {
      return word.charAt(0).toUpperCase() + word.slice(1);
    });
    return capitalizedWords.join(' ');
  }

  // Снятие активностей у placeholder
  function removeActiveStatus() {
    inputs.forEach(input => {
      const placeholder = input.previousElementSibling;
      placeholder.classList.remove('active');
    });
  }


 function validateName(surname, name, lastname, surnameInput, nameInput, lastnameInput, errorElement) {
    const validationName = /[^a-zA-Zа-яА-ЯёЁ\s-]/;

   // Функция для скрытия ошибки и удаления класса input--error
   function clearErrorOnInput(input) {
    input.addEventListener('input', () => {
      errorElement.style.display = 'none';
      input.classList.remove('input--error');
    });
  }
    // Применение функции для всех полей
    clearErrorOnInput(surnameInput);
    clearErrorOnInput(nameInput);
    clearErrorOnInput(lastnameInput);

    // Проверка на наличие символов или цифр в имени, фамилии и отчестве
    if (validationName.test(surname)) {
      surnameInput.classList.add('input--error');
      errorElement.style.display = 'block';
      throw new Error('Имя, фамилия и отчество не должны содержать символы или цифры.');
    }
    if (validationName.test(name)) {
      nameInput.classList.add('input--error');
      errorElement.style.display = 'block';
      throw new Error('Имя, фамилия и отчество не должны содержать символы или цифры.');
    }
    if (validationName.test(lastname)) {
      lastnameInput.classList.add('input--error');
      errorElement.style.display = 'block';
      throw new Error('Имя, фамилия и отчество не должны содержать символы или цифры.');
    }

    // Проверка на пустые значения
    if (surname.trim().length === EMPTY_VALUE) {
      surnameInput.classList.add('input--error');
      errorElement.style.display = 'block';
      throw new Error('Фамилия и имя обязательны к заполнению.');
    }
    if (name.trim().length === EMPTY_VALUE) {
      nameInput.classList.add('input--error');
      throw new Error('Фамилия и имя обязательны к заполнению.');
    }

    // Проверка на минимальную длину
    if (surname.trim().length < MIN_LENGHT_SYMBOLS) {
      surnameInput.classList.add('input--error');
      errorElement.style.display = 'block';
      throw new Error('Имя, фамилия и отчество не могут быть короче 2х букв.');
    }

    if (name.trim().length < MIN_LENGHT_SYMBOLS) {
      nameInput.classList.add('input--error');
      errorElement.style.display = 'block';
      throw new Error('Имя, фамилия и отчество не могут быть короче 2х букв.');
    }

    if (lastname.trim().length > EMPTY_VALUE && lastname.trim().length < MIN_LENGHT_SYMBOLS) {
      lastnameInput.classList.add('input--error');
      errorElement.style.display = 'block';
      throw new Error('Имя, фамилия и отчество не могут быть короче 2х букв.');
    }

    // Скрытие сообщения об ошибке
    errorElement.style.display = 'none';
}


function validateContacts(contactsWrapper, errorElement) {
  const validationPhone = /[^\d\s+()-]/;
  const validationEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const contacts = [];

  // Функция для скрытия ошибки и удаления класса input--error при вводе данных
  function clearErrorOnInput(input) {
    input.addEventListener('input', () => {
      errorElement.style.display = 'none';
    });
  }

  contactsWrapper.forEach(contactWrapper => {
    const contactInput = contactWrapper.querySelector('.contact');
    const contact = contactInput.value;
    const type = contactWrapper.querySelector('.dropdown__wrapper .type').textContent;

    // Применение функции для поля ввода контакта
    clearErrorOnInput(contactInput);

    if (type === 'Телефон' && validationPhone.test(contact)) {
      contactInput.classList.add('input--error');
      errorElement.style.display = 'block';
      throw new Error('Телефон не должен содержать буквы и символы.');
    }

    if (type === 'Email' && !validationEmail.test(contact)) {
      contactInput.classList.add('input--error');
      errorElement.style.display = 'block';
      throw new Error('Email должен соответствовать правильному формату электронной почты jsmith@example.com.');
    }

    if (contact.trim() === '') {
      contactInput.classList.add('input--error');
      errorElement.style.display = 'block';
      throw new Error('Контакт не может быть пустым');
    }

    if (contact.trim() !== '') {
      contacts.push({ type, value: contact });
    }
  });

  return contacts;
}


  /* -- Основной функционал программы -- */
  function addClientsToList(client) {
    const clientItems = document.createElement('div');
    clientItems.classList.add('clients__item', 'flex');

    clientItems.appendChild(createClientId(client.id));
    clientItems.appendChild(createClientFullName(client));
    clientItems.appendChild(createClientDate('create', client.createdAt));
    clientItems.appendChild(createClientDate('change', client.updatedAt));
    clientItems.appendChild(createContactContainer(client.contacts));
    clientItems.appendChild(createClientActions(client));

    list.appendChild(clientItems);
}

function createClientId(id) {
    const clientId = createElement('div', 'clients__id', '');
    const clientIdSpan = createElement('span', 'clients__grey', id);
    clientId.appendChild(clientIdSpan);
    return clientId;
}

function createClientFullName(client) {
    return createElement('div', 'clients__name', `${client.surname} ${client.name} ${client.lastName}`);
}

function createClientDate(type, dateString) {
    const date = new Date(dateString);
    const formattedDate = formatDate(date);
    const formattedTime = formatTime(date);

    const clientDate = createElement('div', 'clients__date', formattedDate);
    clientDate.classList.add(`clients__date--${type}`);
    const clientTime = createElement('span', 'clients__time', formattedTime);
    clientDate.appendChild(clientTime);

    return clientDate;
}

function formatDate(date) {
    return `${padZero(date.getDate())}.${padZero(date.getMonth() + 1)}.${date.getFullYear()}`;
}

function formatTime(date) {
    return `${padZero(date.getHours())}.${padZero(date.getMinutes())}`;
}

function padZero(number) {
    return number < 10 ? `0${number}` : number;
}

function createContactContainer(contacts) {
    const contactContainer = document.createElement('div');
    contactContainer.classList.add('clients__contacts', 'flex');

    contacts.forEach(contact => {
        const contactElement = createContactElement(contact);
        contactContainer.appendChild(contactElement);
    });

    return contactContainer;
}

function createContactElement(contact) {
    const contactElement = document.createElement('div');
    contactElement.classList.add('contact__item');

    const typeElement = document.createElement('span');
    typeElement.classList.add('contact__type');

    const valueElement = createContactValue(contact);

    contactElement.appendChild(typeElement);
    contactElement.appendChild(valueElement);

    const iconElement = createContactIcon(contact.type);
    typeElement.insertBefore(iconElement, typeElement.firstChild);

    addHoverEffect(iconElement, valueElement);

    return contactElement;
}

function createContactValue(contact) {
    const valueElement = document.createElement('span');
    valueElement.classList.add('contact__value');
    valueElement.textContent = contact.type === 'Другое' ? contact.value : `${contact.type}: ${contact.value}`;
    return valueElement;
}

function createContactIcon(type) {
    const iconElement = document.createElement('i');
    iconElement.classList.add('contact__icon');

    switch (type) {
        case 'Телефон':
            iconElement.classList.add('icon-phone');
            break;
        case 'Другое':
            iconElement.classList.add('icon-additional');
            break;
        case 'Email':
            iconElement.classList.add('icon-email');
            break;
        case 'Vk':
            iconElement.classList.add('icon-vk');
            break;
        case 'Facebook':
            iconElement.classList.add('icon-facebook');
            break;
    }

    return iconElement;
}

function addHoverEffect(iconElement, valueElement) {
    iconElement.addEventListener('mouseenter', () => {
        valueElement.style.display = 'inline-block';
    });

    iconElement.addEventListener('mouseleave', () => {
        valueElement.style.display = 'none';
    });
}

function createClientActions(client) {
    const clientButtons = createElement('div', 'clients__actions', '');

    const changesBtn = createElement('button', 'btn', 'Изменить');
    changesBtn.classList.add('btn__reset', 'btn__change');
    changesBtn.addEventListener('click', () => windowChangeClient(client.id, client.surname, client.name, client.lastName, client.contacts));

    const deleteBtn = createElement('button', 'btn', 'Удалить');
    deleteBtn.classList.add('btn__reset', 'btn__delete');
    deleteBtn.addEventListener('click', () => openDelWindow(client.id));

    clientButtons.appendChild(changesBtn);
    clientButtons.appendChild(deleteBtn);

    return clientButtons;
}

  /* Сортировки */

  // Сброс всех стрелок в исходное положение
  function resetAllArrows() {
    const allArrows = document.querySelectorAll('.arrow');
    allArrows.forEach(arrow => {
      arrow.classList.remove('desc');
    });
  }

const sortingButtonId = document.getElementById('id');
const arrowIconId = sortingButtonId.querySelector('.arrow--id');
let sortingDirectionId = 'asc';

  function sortingById(clientA, clientB) {
    const idA = `${clientA.id}`.toLowerCase();
    const idB = `${clientB.id}`.toLowerCase();
    return idA.localeCompare(idB);
  }

  function sortingClientsById(data) {
    const sortedData = [...data];
    sortedData.sort((a, b) => {
      let result = 0;
      if (sortingDirectionId === 'asc') {
        result = sortingById(a, b);
      } else {
        result = sortingById(b, a);
      }
      return result;
    });
    return sortedData;
  }

  sortingButtonId.addEventListener('click', async () => {
    resetAllArrows(); // Сброс всех стрелок
    arrowIconId.classList.remove('desc');
    sortingDirectionId = sortingDirectionId === 'asc' ? 'desc' : 'asc';
    const data = await loadClients();
    const sortedData = sortingClientsById(data);
    list.innerHTML = ''; // очищаем список перед загрузкой новых данных
    sortedData.forEach(addClientsToList);
    arrowIconId.classList.toggle('desc', sortingDirectionId === 'desc');
  });

  const sortingButtonFullName = document.getElementById('fullName');
  const arrowIconFullName = sortingButtonFullName.querySelector('.arrow--fullName');
  let sortingDirectionName = 'asc';

  function sortingByFullName(clientA, clientB) {
    const fullNameA = `${clientA.surname} ${clientA.name} ${clientA.lastname}`.toLowerCase();
    const fullNameB = `${clientB.surname} ${clientB.name} ${clientB.lastname}`.toLowerCase();
    return fullNameA.localeCompare(fullNameB);
  }

  function sortingClientsByFullName(data) {
    const sortedData = [...data];
    sortedData.sort((a, b) => {
      let result = 0;
      if (sortingDirectionName === 'asc') {
        result = sortingByFullName(a, b);
      } else {
        result = sortingByFullName(b, a);
      }
      return result;
    });
    return sortedData;
  }

  sortingButtonFullName.addEventListener('click', async () => {
    resetAllArrows(); // Сброс всех стрелок
    arrowIconFullName.classList.remove('desc');
    sortingDirectionName = sortingDirectionName === 'asc' ? 'desc' : 'asc';
    const data = await loadClients();
    const sortedData = sortingClientsByFullName(data);
    list.innerHTML = ''; // очищаем список перед загрузкой новых данных
    sortedData.forEach(addClientsToList);
    arrowIconFullName.classList.toggle('desc', sortingDirectionName === 'desc');
  });

  const sortingButtonCreate = document.getElementById('dateCreate');
  const arrowIconCreate = sortingButtonCreate.querySelector('.arrow--create');
  let sortingDirectionCreate = 'asc';

  function sortingByCreate(clientA, clientB) {
    const createdAtA = new Date(clientA.createdAt);
    const createdAtB = new Date(clientB.createdAt);
    return sortingDirectionCreate === 'asc' ? createdAtA - createdAtB : createdAtB - createdAtA;
  }

  function sortingClientsByCreate(data) {
    const sortedData = [...data];
    sortedData.sort(sortingByCreate);
    return sortedData;
  }

  sortingButtonCreate.addEventListener('click', async () => {
    resetAllArrows(); // Сброс всех стрелок
    arrowIconCreate.classList.remove('desc');
    sortingDirectionCreate = sortingDirectionCreate === 'asc' ? 'desc' : 'asc';
    const data = await loadClients();
    const sortedData = sortingClientsByCreate(data);
    list.innerHTML = ''; // очищаем список перед загрузкой новых данных
    sortedData.forEach(addClientsToList);
    arrowIconCreate.classList.toggle('desc', sortingDirectionCreate === 'desc');
  });

  const sortingButtonChange = document.getElementById('dateChange');
  const arrowIconChange = sortingButtonChange.querySelector('.arrow--change');
  let sortingDirectionChange = 'asc';

  function sortingByChange(clientA, clientB) {
    const updateAtA = new Date(clientA.updatedAt);
    const updateAtB = new Date(clientB.updatedAt);
    return sortingDirectionChange === 'asc' ? updateAtA - updateAtB : updateAtB - updateAtA;
  }

  function sortingClientsByChange(data) {
    const sortedData = [...data];
    sortedData.sort(sortingByChange);
    return sortedData;
  }

  sortingButtonChange.addEventListener('click', async () => {
    resetAllArrows(); // Сброс всех стрелок
    arrowIconChange.classList.remove('desc');
    sortingDirectionChange = sortingDirectionChange === 'asc' ? 'desc' : 'asc';
    const data = await loadClients();
    const sortedData = sortingClientsByChange(data);
    list.innerHTML = ''; // очищаем список перед загрузкой новых данных
    sortedData.forEach(addClientsToList);
    arrowIconChange.classList.toggle('desc', sortingDirectionChange === 'desc');
  });

  /* -- Функции для работы с модальными окнами -- */
  /* Окно добавления */
  const modalAddClient = document.getElementById("modalWindowAdd");
  const clientAddBtn = document.getElementById("clientAdd");
  const cancelAddClient = modalAddClient.querySelector('.btn__cancel--add');
  const closeAdd = modalAddClient.querySelector('.modal__close--add');
  const inputContactsAdd = modalAddClient.querySelector('.input__contacts');
  const inputs = modalAddClient.querySelectorAll('.input');

  /* Открываем окно */
  clientAddBtn.addEventListener("click", function() {
    modalAddClient.classList.add('show');
    modalAddClient.querySelector('.btn__contacts--add').style.display = 'block';

    const errorAdd = document.getElementById('errorModalAdd');
    const surnameInput = document.getElementById('surnameAdd');
    const nameInput = document.getElementById('nameAdd');
    const lastnameInput = document.getElementById('lastnameAdd');

    clearInput(surnameInput, errorAdd);
    clearInput(nameInput, errorAdd);
    clearInput(lastnameInput, errorAdd);

    completionPlaceholders(modalAddClient);
  });

    //создание контактов при добавлении клиента
  const addContactsBtnAdd = document.getElementById('addContactWindowAddClient');
  const contactInputAdd = document.querySelector('.contacts__list--add');

  function checkContactsCount(modalElement, containerSelector, buttonSelector, maxContacts = 10) {
    const contactWrappers = modalElement.querySelectorAll(containerSelector);
    const addContactsButton = modalElement.querySelector(buttonSelector);
    console.log(contactWrappers.length);

    if (contactWrappers.length >= maxContacts) {
      addContactsButton.style.display = 'none';
    } else {
      addContactsButton.style.display = 'block';
    }
  }

  /* Добавление контактов */
  addContactsBtnAdd.addEventListener('click',  async (e) => {
    e.preventDefault();
    inputContactsAdd.classList.add('input__contacts--indent');
    createContactInput(modalAddClient, contactInputAdd, '.contact__wrapper', '#addContactWindowAddClient');
  });

  // Функция для удаления различных атрибутов
  function removeEmptyContacts() {
    const contactsWrapper = modalAddClient.querySelectorAll('.contact__wrapper');
    contactsWrapper.forEach(contactWrapper => {
    const contactInput = contactWrapper.querySelector('.contact');
    inputContactsAdd.classList.remove('input__contacts--indent');
    contactWrapper.remove();
    });
  }


   // Отмена добавления
   cancelAddClient.addEventListener("click", function() {
    modalAddClient.classList.remove('show');
    removeEmptyContacts();
  });

   // Закрытие модального окна  на крестик
   closeAdd.addEventListener("click", function() {
    modalAddClient.classList.remove('show');
    removeActiveStatus();
    removeEmptyContacts();
  });

  // Закрытие модального окна при клике вне его
  window.addEventListener("click", function(event) {
    if (event.target === modalAddClient) {
      modalAddClient.classList.remove('show');
      removeActiveStatus();
      removeEmptyContacts();
    }
  });

  /* Окно изменения */
  const modalChange = document.getElementById("modalWindowChange");
  const deleteChangeClient = modalChange.querySelector('.btn__del--change');
  const closeChange = modalChange.querySelector('.modal__close--change');
  const inputContactsChange = modalChange.querySelector('.input__contacts');

    //создание контактов при добавлении клиента
  const addContactsBtnChange = document.getElementById('addContactWindowChange');
  const contactInputChange = document.querySelector('.contacts__list--change');

  /* Добавление контактов */
  addContactsBtnChange.addEventListener('click',  async (e) => {
    e.preventDefault();
    inputContactsChange.classList.add('input__contacts--indent');
    createContactInput(modalChange, contactInputChange, '.contact__wrapper', '#addContactWindowChange');
  });

  const saveChange = document.getElementById("saveChange");
  saveChange.addEventListener('click',  async (e) => {
    e.preventDefault();
    if (window.location.hash.includes('#client-')) {
      history.replaceState(null, null, ' ');
    }
    changeClient();

  });

  // Закрытие модального окна  на крестик
  closeChange.addEventListener("click", function() {
    inputContactsChange.classList.remove('input__contacts--indent');
    if (window.location.hash.includes('#client-')) {
      history.replaceState(null, null, ' ');
    }
    modalChange.classList.remove('show');
    removeEmptyContacts();
    removeContacts(modalChange);

  });

  // Закрытие модального окна при клике вне его
  window.addEventListener("click", function(event) {
    if (event.target === modalChange) {
      if (window.location.hash.includes('#client-')) {
        history.replaceState(null, null, ' ');
      }
      inputContactsChange.classList.remove('input__contacts--indent');
      modalChange.classList.remove('show');
      removeEmptyContacts();
      removeContacts(modalChange);

    }
  });

  // Удаление клиента в окне изменения
  deleteChangeClient.addEventListener('click',  async (e) => {
    e.preventDefault();
    let id = document.getElementById('idChange').innerHTML.split(": ")[1]; // Извлекаем ID из текста
    openDelWindow(id);
    modalChange.classList.remove('show');
    if (window.location.hash.includes('#client')) {
      history.replaceState(null, null, ' ');
    }
  });

  async function windowChangeClient(id, surname, name, lastName, contacts) {
    const modalChange = document.getElementById("modalWindowChange");
    modalChange.classList.add('show');


    window.location.hash = '#client-' + id;

    document.getElementById('idChange').innerHTML = "ID: " + id;
    document.getElementById('surnameChange').value = surname;
    document.getElementById('nameChange').value = name;
    document.getElementById('lastnameChange').value = lastName;

    completionPlaceholders(modalChange);
    // Получаем контейнер для контактов в окне изменения клиента
    const contactInput = document.querySelector('.contacts__list--change');
    contactInput.innerHTML = '';

    // Получаем контейнер для добавления контактов
    const contactAddChange = document.querySelector('.input__contacts--change');
    // Удаляем класс 'input__contacts--indent' если он есть
    contactAddChange.classList.remove('input__contacts--indent');

    // Создаем контакты клиента в окне изменения
    if (contacts.length > 0) {
      contactAddChange.classList.add('input__contacts--indent');
      contacts.forEach(contact => {
        const clientContactWrapper = createElement('div', 'contact__wrapper', '');
        clientContactWrapper.classList.add('flex');

        const options = ['Телефон', 'Email',  'Vk',  'Facebook', 'Другое'];
        const clientContactType = document.createElement('div');
        clientContactType.classList.add('dropdown__wrapper');

        const dropdownButton = document.createElement('div');
        dropdownButton.classList.add('dropdown__button');
        dropdownButton.classList.add('type');
        dropdownButton.textContent = contact.type; // Установка сохраненного типа контакта
        clientContactType.appendChild(dropdownButton);

        const dropdownList = document.createElement('ul');
        dropdownList.classList.add('dropdown__list');
        clientContactType.appendChild(dropdownList);

        options.forEach(option => {
          const listItem = document.createElement('li');
          listItem.classList.add('dropdown__item');
          listItem.textContent = option;
          listItem.addEventListener('click', () => {
            dropdownButton.textContent = option;
            dropdownList.classList.remove('show');
          });
          dropdownList.appendChild(listItem);
        });

        dropdownButton.addEventListener('click', () => {
          dropdownList.classList.toggle('show');
          dropdownButton.classList.toggle('open');
        });

        const clientContact = createElement('input', 'contact', '');
        clientContact.classList.add('contact__input');
        clientContact.placeholder = 'Введите данные контакта';
        clientContact.value = contact.value; // Заполняем значение контакта

        const deleteButton = document.createElement('button');
        deleteButton.classList.add('contact__delete');
        const deleteButtonHint = createElement('div', 'button__hint', 'Удалить контакт');
        deleteButton.appendChild(deleteButtonHint);

        deleteButton.style.display = 'inline-block'; // Показываем кнопку удаления

        deleteButton.addEventListener('click', function() {
          clientContactWrapper.remove();
        });

        clientContactWrapper.appendChild(clientContactType);
        clientContactWrapper.appendChild(clientContact);
        clientContactWrapper.appendChild(deleteButton);
        contactInput.appendChild(clientContactWrapper);
      });
    }
    checkContactsCount(modalChange, '.contact__wrapper', '#addContactWindowChange');
  }

  /* Окно удаления */
  const modalDelete = document.getElementById("modalDelete");
  const cancelDel = modalDelete.querySelector('.btn__cancel--delete');
  const closeDel = modalDelete.querySelector('.modal__close--delete');
  const deleteClientItem = document.getElementById('modalDeleteBntDel');

  function openDelWindow(index) {
    modalDelete.classList.add('show');
    currentClientIndex = index;
  }

  deleteClientItem.addEventListener('click', async (e) => {
    e.preventDefault();
    await deleteClient(currentClientIndex);
    modalDelete.classList.remove('show');
  });

  cancelDel.addEventListener('click', () => {
    modalDelete.classList.remove('show');
  });

  closeDel.addEventListener('click', () => {
    modalDelete.classList.remove('show');
  });

  window.addEventListener("click", function(event) {
    if (event.target === modalDelete) {
      modalDelete.classList.remove('show');
    }
  });
});
