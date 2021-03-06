'use strict';

const express = require(`express`);
const request = require(`supertest`);
const Sequelize = require(`sequelize`);

const initDB = require(`../lib/init-db`);
const passwordUtils = require(`../lib/password`);
const category = require(`./category`);
const DataService = require(`../data-service/category`);

const {HttpCode} = require(`../../constants`);

const mockCategories = [
  `Железо`,
  `Деревья`,
  `Кино`,
  `За жизнь`,
  `Разное`,
  `Без рамки`,
  `IT`,
  `Музыка`,
  `Программирование`,
];

const mockUsers = [
  {
    firstName: `Иван`,
    lastName: `Иванов`,
    email: `ivanov@example.com`,
    passwordHash: passwordUtils.hashSync(`ivanov`),
    avatar: `avatar-1.jpg`,
    isAdmin: false,
  },
  {
    firstName: `Пётр`,
    lastName: `Петров`,
    email: `petrov@example.com`,
    passwordHash: passwordUtils.hashSync(`petrov`),
    avatar: `avatar-2.jpg`,
    isAdmin: false,
  }
];

const mockPosts = [
  /* eslint-disable */
  {
    "user": `ivanov@example.com`,
    "title": "Обзор новейшего смартфона.",
    "createdDate": "11.02.2021, 08:37:49",
    "announce": "Этот смартфон — настоящая находка. Большой и яркий экран мощнейший процессор — всё это в небольшом гаджете. Золотое сечение — соотношение двух величин, гармоническая пропорция. Он написал больше 30 хитов. Помните, небольшое количество ежедневных упражнений лучше, чем один раз, но много.",
    "fullText": "Это один из лучших рок-музыкантов. Помните, небольшое количество ежедневных упражнений лучше, чем один раз, но много. Первая большая ёлка была установлена только в 1938 году. Как начать действовать? Для начала просто соберитесь. Альбом стал настоящим открытием года. Мощные гитарные рифы и скоростные соло-партии не дадут заскучать. Собрать камни бесконечности легко, если вы прирожденный герой. Из под его пера вышло 8 платиновых альбомов. Освоить вёрстку несложно. Возьмите книгу новую книгу и закрепите все упражнения на практике. Простые ежедневные упражнения помогут достичь успеха. Рок-музыка всегда ассоциировалась с протестами. Так ли это на самом деле? Игры и программирование разные вещи. Не стоит идти в программисты, если вам нравятся только игры. Ёлки — это не просто красивое дерево. Это прочная древесина. Золотое сечение — соотношение двух величин, гармоническая пропорция. Этот смартфон — настоящая находка. Большой и яркий экран мощнейший процессор — всё это в небольшом гаджете. Вы можете достичь всего. Стоит только немного постараться и запастись книгами. Он написал больше 30 хитов. Процессор заслуживает особого внимания. Он обязательно понравится геймерам со стажем. Программировать не настолько сложно, как об этом говорят. Бороться с прокрастинацией несложно. Просто действуйте. Маленькими шагами.",
    "categories": [
      "Железо",
      "Деревья",
      "Кино",
      "За жизнь",
      "Без рамки",
      "IT"
    ],
    "comments": [
      {
        "user": `petrov@example.com`,
        "text": "Плюсую, но слишком много буквы! Мне не нравится ваш стиль. Ощущение, что вы меня поучаете. Хочу такую же футболку :-)"
      },
      {
        "text": "Это где ж такие красоты? Планируете записать видосик на эту тему? Совсем немного..."
      },
      {
        "user": `ivanov@example.com`,
        "text": "Согласен с автором!"
      },
      {
        "user": `petrov@example.com`,
        "text": "Совсем немного... Мне не нравится ваш стиль. Ощущение, что вы меня поучаете. Это где ж такие красоты?"
      }
    ]
  },
  {
    "user": `petrov@example.com`,
    "title": "Как собрать камни бесконечности.",
    "createdDate": "22.03.2021, 07:58:44",
    "announce": "Как начать действовать? Для начала просто соберитесь. Этот смартфон — настоящая находка. Большой и яркий экран мощнейший процессор — всё это в небольшом гаджете. Достичь успеха помогут ежедневные повторения. Процессор заслуживает особого внимания. Он обязательно понравится геймерам со стажем.",
    "fullText": "Освоить вёрстку несложно. Возьмите книгу новую книгу и закрепите все упражнения на практике. Простые ежедневные упражнения помогут достичь успеха. Собрать камни бесконечности легко, если вы прирожденный герой. Это один из лучших рок-музыкантов. Золотое сечение — соотношение двух величин, гармоническая пропорция. Ёлки — это не просто красивое дерево. Это прочная древесина. Первая большая ёлка была установлена только в 1938 году. Помните, небольшое количество ежедневных упражнений лучше, чем один раз, но много. Из под его пера вышло 8 платиновых альбомов. Рок-музыка всегда ассоциировалась с протестами. Так ли это на самом деле? Этот смартфон — настоящая находка. Большой и яркий экран мощнейший процессор — всё это в небольшом гаджете. Достичь успеха помогут ежедневные повторения. Альбом стал настоящим открытием года. Мощные гитарные рифы и скоростные соло-партии не дадут заскучать. Игры и программирование разные вещи. Не стоит идти в программисты, если вам нравятся только игры. Программировать не настолько сложно, как об этом говорят. Процессор заслуживает особого внимания. Он обязательно понравится геймерам со стажем. Как начать действовать? Для начала просто соберитесь. Бороться с прокрастинацией несложно. Просто действуйте. Маленькими шагами. Он написал больше 30 хитов.",
    "categories": [
      "За жизнь"
    ],
    "comments": [
      {
        "user": `ivanov@example.com`,
        "text": "Давно не пользуюсь стационарными компьютерами. Ноутбуки победили. Это где ж такие красоты? Плюсую, но слишком много буквы!"
      },
      {
        "user": `petrov@example.com`,
        "text": "Согласен с автором! Планируете записать видосик на эту тему?"
      }
    ]
  },
  {
    "user": `ivanov@example.com`,
    "title": "Как перестать беспокоиться и начать жить.",
    "createdDate": "06.04.2021, 00:45:40",
    "announce": "Простые ежедневные упражнения помогут достичь успеха. Это один из лучших рок-музыкантов. Программировать не настолько сложно, как об этом говорят. Первая большая ёлка была установлена только в 1938 году.",
    "fullText": "Как начать действовать? Для начала просто соберитесь. Игры и программирование разные вещи. Не стоит идти в программисты, если вам нравятся только игры. Собрать камни бесконечности легко, если вы прирожденный герой. Процессор заслуживает особого внимания. Он обязательно понравится геймерам со стажем. Освоить вёрстку несложно. Возьмите книгу новую книгу и закрепите все упражнения на практике. Альбом стал настоящим открытием года. Мощные гитарные рифы и скоростные соло-партии не дадут заскучать. Программировать не настолько сложно, как об этом говорят. Бороться с прокрастинацией несложно. Просто действуйте. Маленькими шагами. Это один из лучших рок-музыкантов. Из под его пера вышло 8 платиновых альбомов. Помните, небольшое количество ежедневных упражнений лучше, чем один раз, но много. Достичь успеха помогут ежедневные повторения. Он написал больше 30 хитов. Золотое сечение — соотношение двух величин, гармоническая пропорция. Первая большая ёлка была установлена только в 1938 году. Ёлки — это не просто красивое дерево. Это прочная древесина. Рок-музыка всегда ассоциировалась с протестами. Так ли это на самом деле? Простые ежедневные упражнения помогут достичь успеха. Вы можете достичь всего. Стоит только немного постараться и запастись книгами.",
    "categories": [
      "Музыка"
    ],
    "comments": [
      {
        "user": `petrov@example.com`,
        "text": "Планируете записать видосик на эту тему?"
      },
      {
        "user": `ivanov@example.com`,
        "text": "Согласен с автором! Совсем немного..."
      }
    ]
  },
  {
    "user": `petrov@example.com`,
    "title": "Рок — это протест.",
    "createdDate": "27.03.2021, 21:21:06",
    "announce": "Процессор заслуживает особого внимания. Он обязательно понравится геймерам со стажем. Программировать не настолько сложно, как об этом говорят. Как начать действовать? Для начала просто соберитесь. Освоить вёрстку несложно. Возьмите книгу новую книгу и закрепите все упражнения на практике.",
    "fullText": "Золотое сечение — соотношение двух величин, гармоническая пропорция. Рок-музыка всегда ассоциировалась с протестами. Так ли это на самом деле? Первая большая ёлка была установлена только в 1938 году. Процессор заслуживает особого внимания. Он обязательно понравится геймерам со стажем. Собрать камни бесконечности легко, если вы прирожденный герой. Бороться с прокрастинацией несложно. Просто действуйте. Маленькими шагами. Простые ежедневные упражнения помогут достичь успеха. Достичь успеха помогут ежедневные повторения. Программировать не настолько сложно, как об этом говорят. Этот смартфон — настоящая находка. Большой и яркий экран мощнейший процессор — всё это в небольшом гаджете. Ёлки — это не просто красивое дерево. Это прочная древесина. Освоить вёрстку несложно. Возьмите книгу новую книгу и закрепите все упражнения на практике. Он написал больше 30 хитов. Альбом стал настоящим открытием года. Мощные гитарные рифы и скоростные соло-партии не дадут заскучать. Игры и программирование разные вещи. Не стоит идти в программисты, если вам нравятся только игры. Из под его пера вышло 8 платиновых альбомов. Это один из лучших рок-музыкантов. Вы можете достичь всего. Стоит только немного постараться и запастись книгами. Как начать действовать? Для начала просто соберитесь.",
    "categories": [
      "За жизнь",
      "Кино",
      "Деревья",
      "IT",
      "Железо"
    ],
    "comments": [
      {
        "user": `ivanov@example.com`,
        "text": "Планируете записать видосик на эту тему?"
      },
      {
        "user": `petrov@example.com`,
        "text": "Плюсую, но слишком много буквы! Мне кажется или я уже читал это где-то? Согласен с автором!"
      },
      {
        "user": `ivanov@example.com`,
        "text": "Планируете записать видосик на эту тему?"
      }
    ]
  },
  {
    "user": `ivanov@example.com`,
    "title": "Как достигнуть успеха не вставая с кресла.",
    "createdDate": "12.03.2021, 17:53:25",
    "announce": "Ёлки — это не просто красивое дерево. Это прочная древесина. Альбом стал настоящим открытием года. Мощные гитарные рифы и скоростные соло-партии не дадут заскучать. Освоить вёрстку несложно. Возьмите книгу новую книгу и закрепите все упражнения на практике. Он написал больше 30 хитов.",
    "fullText": "Помните, небольшое количество ежедневных упражнений лучше, чем один раз, но много. Бороться с прокрастинацией несложно. Просто действуйте. Маленькими шагами. Альбом стал настоящим открытием года. Мощные гитарные рифы и скоростные соло-партии не дадут заскучать. Вы можете достичь всего. Стоит только немного постараться и запастись книгами. Собрать камни бесконечности легко, если вы прирожденный герой. Простые ежедневные упражнения помогут достичь успеха. Он написал больше 30 хитов. Золотое сечение — соотношение двух величин, гармоническая пропорция. Игры и программирование разные вещи. Не стоит идти в программисты, если вам нравятся только игры. Первая большая ёлка была установлена только в 1938 году. Рок-музыка всегда ассоциировалась с протестами. Так ли это на самом деле? Процессор заслуживает особого внимания. Он обязательно понравится геймерам со стажем. Этот смартфон — настоящая находка. Большой и яркий экран мощнейший процессор — всё это в небольшом гаджете. Достичь успеха помогут ежедневные повторения. Освоить вёрстку несложно. Возьмите книгу новую книгу и закрепите все упражнения на практике. Как начать действовать? Для начала просто соберитесь. Ёлки — это не просто красивое дерево. Это прочная древесина. Это один из лучших рок-музыкантов. Программировать не настолько сложно, как об этом говорят.",
    "categories": [
      "Железо",
      "Программирование",
      "Деревья",
      "IT",
      "Без рамки",
      "За жизнь"
    ],
    "comments": [
      {
        "user": `ivanov@example.com`,
        "text": "Хочу такую же футболку :-)"
      },
      {
        "user": `petrov@example.com`,
        "text": "Плюсую, но слишком много буквы! Давно не пользуюсь стационарными компьютерами. Ноутбуки победили."
      }
    ]
  }
  /* eslint-enable */
];

const mockDB = new Sequelize(`sqlite::memory:`, {logging: false});

const app = express();
app.use(express.json());

beforeAll(async () => {
  await initDB(mockDB, {categories: mockCategories, posts: mockPosts, users: mockUsers});
  category(app, new DataService(mockDB));
});

describe(`API returns category list`, () => {

  let response;

  beforeAll(async () => {
    response = await request(app)
      .get(`/categories`);
  });

  test(`Status code 200`, () => expect(response.statusCode).toBe(HttpCode.OK));
  test(`Returns list of 9 categories`, () => expect(response.body.length).toBe(9));

  test(`Category names are "Железо", "Деревья", "Кино", "За жизнь", "Разное", "Без рамки", "IT", "Музыка", "Программирование"`,
      () => expect(response.body.map((it) => it.name)).toEqual(
          expect.arrayContaining([`Железо`, `Деревья`, `Кино`, `За жизнь`, `Разное`, `Без рамки`, `IT`, `Музыка`, `Программирование`])
      )
  );
});

describe(`API creates a new category if data is valid`, () => {
  const newCategory = {
    name: `correct category name`
  };

  let response;

  beforeAll(async () => {
    response = await request(app)
      .post(`/categories/add`)
      .send(newCategory);
  });

  test(`Status code 201`, () => expect(response.statusCode).toBe(HttpCode.OK));
  test(`Categories count is changed`, () => request(app)
    .get(`/categories`)
    .expect((res) => expect(res.body.length).toBe(10))
  );
});

describe(`API refuses to create a new category if data is invalid`, () => {
  const newCategory = {
    name: `Дом`
  };

  let response;

  beforeAll(async () => {
    response = await request(app)
      .post(`/categories/add`)
      .send(newCategory);
  });

  test(`Status code 400 if category name is too short`, () => expect(response.statusCode).toBe(HttpCode.BAD_REQUEST));
});

describe(`API correctly changes category name`, () => {
  const newCategory = {
    name: `Новая категория`
  };

  let response;

  beforeAll(async () => {
    response = await request(app)
      .put(`/categories/1/update`)
      .send(newCategory);
  });

  test(`Status code 200`, () => expect(response.statusCode).toBe(HttpCode.OK));

  test(`Category name changed`, () => request(app)
    .get(`/categories`)
    .expect((res) => expect(res.body[0].name).toBe(`Новая категория`))
  );
});

describe(`API refuses to change category name if data is invalid`, () => {
  const newCategory = {
    name: `Слишком длинное название для категории`
  };

  let response;

  beforeAll(async () => {
    response = await request(app)
      .put(`/categories/1/update`)
      .send(newCategory);
  });

  test(`Status code 400`, () => expect(response.statusCode).toBe(HttpCode.BAD_REQUEST));

  test(`Category name doesn't changed`, () => request(app)
    .get(`/categories`)
    .expect((res) => expect(res.body[0].name).toBe(`Новая категория`))
  );
});

describe(`API correctly deletes a category`, () => {
  let response;

  beforeAll(async () => {
    response = await request(app)
      .delete(`/categories/5/delete`);
  });

  test(`Status code 200`, () => expect(response.statusCode).toBe(HttpCode.OK));
  test(`Categories count is changed`, () => request(app)
    .get(`/categories`)
    .expect((res) => expect(res.body.length).toBe(9))
  );
});

describe(`API refuses to delete a non-empty category`, () => {
  let response;

  beforeAll(async () => {
    response = await request(app)
      .delete(`/categories/3/delete`);
  });

  test(`Status code 400`, () => expect(response.statusCode).toBe(HttpCode.BAD_REQUEST));
  test(`Categories count is not changed`, () => request(app)
    .get(`/categories`)
    .expect((res) => expect(res.body.length).toBe(9))
  );
});
