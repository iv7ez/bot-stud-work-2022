const { Markup } = require("telegraf");
const controllers = require("../methods");
const { parse, format } = require("../utils/parse");
const glossary = require("../assets/glossary");
module.exports = [
  {
    children: [
      {
        path: "",
        action: async function ({ ctx, params, router }) {
          await ctx.reply("Чем могу помочь?", {
            reply_markup: {
              keyboard: [
                [Markup.button.callback("Смотреть заявки")],
                [Markup.button.callback("Рассылка")],
                [Markup.button.callback("Просмотр клиентов")],
                [Markup.button.callback("Просмотр коэффициентов")],
                [Markup.button.callback("Выйти")],
              ],
            },
          });
        },
      },
      {
        path: "/message",
        action: async ({ ctx, router }) => {
          const text = ctx.update.message.text;
          if (text == "Смотреть заявки") {
            await router.redirect("/admin/unverified", ctx);
          }
          if (text == "Просмотр клиентов") {
            await router.redirect("/admin/clients", ctx);
          }
          if (text == "Рассылка") {
            await router.redirect("/admin/mailing", ctx);
          }
          if (text == "Просмотр коэффициентов") {
            await router.redirect("/admin/coefficients", ctx);
          }
          if (text == "Выйти") {
            delete ctx.session.adminId;
            await router.redirect("/select-action", ctx);
          }
        },
      },
      {
        path: "/mailing",
        children: [
          {
            path: "",
            action: async ({ ctx }) => {
              await ctx.reply("Введите текст рассылки", {
                reply_markup: {
                  keyboard: [[Markup.button.callback("Назад")]],
                },
              });
            },
          },
          {
            path: "/message",
            action: async ({ ctx, router }) => {
              const text = ctx.update.message.text;
              if (text == "Назад") {
                await router.redirect("/admin", ctx);
                return;
              }
              await controllers.createMessage(text, ctx.tg);
              await ctx.reply("Готово");
              await router.redirect("/admin", ctx);
            },
          },
        ],
      },
      {
        path: "/coefficients",
        children: [
          {
            path: "",
            action: async ({ ctx }) => {
              const data = await controllers.getDocuments();
              await ctx.reply(
                format(data, {
                  адрес: "path",
                  коэффициент: "index",
                }),
                {
                  reply_markup: {
                    keyboard: [[Markup.button.callback("Назад")]],
                  },
                }
              );
            },
          },
          {
            path: "/message",
            action: async ({ ctx, router }) => {
              await router.redirect("/admin", ctx);
            },
          },
        ],
      },
      {
        path: "/clients",
        children: [
          {
            path: "",
            action: async ({ ctx, router }) => {
              const clients = await controllers.getUsers({ verified: true });
              const keyboard = [[Markup.button.callback("Назад")]];
              if (clients.length) {
                keyboard.unshift(
                  [Markup.button.callback("Изменить данные клиента")],
                  [Markup.button.callback("Удалить клиента")]
                );
              }
              await ctx.reply(
                format(clients, {
                  ОГРН: "ogrn",
                  ИНН: "inn",
                  Почта: "mail",
                  "Контактная почта": "mail_personal",
                  Телефон: "phone",
                  "Контактный телефон": "phone_personal",
                  ФИО: "fio",
                  Коэффициент: "coefficient",
                }),
                {
                  reply_markup: {
                    keyboard,
                  },
                }
              );
            },
          },
          {
            path: "/select/:action",
            children: [
              {
                path: "",
                action: async ({ ctx, params, router }) => {
                  ctx.reply(
                    "Чтобы найти клиента, вводите данные в формате ключ: значение (пример ОГРН: 123)",
                    {
                      reply_markup: {
                        keyboard: [[Markup.button.callback("Назад")]],
                      },
                    }
                  );
                },
              },
              {
                path: "/message",
                action: async ({ ctx, params, router }) => {
                  const { text } = ctx.update.message;
                  if (text == "Назад") {
                    await router.redirect("/admin/clients", ctx);
                    return;
                  }
                  const data = parse(text, glossary.collaborator);
                  if (!data) {
                    await ctx.reply("Клиент не найден.");
                    return;
                  }
                  if (params.action == "delete") {
                    const user = await controllers.deleteUser({
                      ...data,
                      verified: true,
                    });
                    if (user) {
                      await ctx.reply("Клиент удален.");
                    } else {
                      await ctx.reply("Клиент не найден.");
                    }
                  }
                  if (params.action == "changeData") {
                    const user = await controllers.getUsers(
                      { ...data, verified: true },
                      false
                    );
                    if (user) {
                      await router.redirect(
                        "/admin/clients/edit/" + user.id,
                        ctx
                      );
                    } else {
                      await ctx.reply("Клиент не найден.");
                    }
                  }
                },
              },
            ],
          },
          {
            path: "/edit/:id",
            children: [
              {
                path: "",
                action: async ({ ctx, params }) => {
                  ctx.reply(
                    "Вводите новые данные в формате ключ: значение (пример ОГРН: 123, ФИО: 123)",
                    {
                      reply_markup: {
                        keyboard: [[Markup.button.callback("Отменить")]],
                      },
                    }
                  );
                },
              },
              {
                path: "/message",
                action: async ({ ctx, params, router }) => {
                  if (ctx.update.message.text == "Отменить") {
                    await router.redirect("/admin/clients", ctx);
                    return;
                  }
                  const data = parse(
                    ctx.update.message.text,
                    glossary.collaborator
                  );
                  if (!data) {
                    await ctx.reply("Введите корректные данные.");
                    return;
                  }
                  const user = await controllers.changeUserData(
                    data,
                    params.id,
                    "admin"
                  );
                  if (user) {
                    await ctx.reply("Данные успешно изменены.");
                  } else {
                    await ctx.reply("Введите корректные данные.");
                  }
                },
              },
            ],
          },
          {
            path: "/message",
            action: async ({ ctx, params, router }) => {
              const text = ctx.update.message.text;
              if (text == "Изменить данные клиента") {
                router.redirect("/admin/clients/select/changeData", ctx);
              }
              if (text == "Удалить клиента") {
                router.redirect("/admin/clients/select/delete", ctx);
              }
              if (text == "Назад") {
                router.redirect("/admin", ctx);
              }
            },
          },
        ],
      },
      {
        path: "/unverified",
        children: [
          {
            path: "",
            action: async ({ ctx, router }) => {
              const clients = await controllers.getUsers({ verified: false });
              const keyboard = [[Markup.button.callback("Назад")]];
              if (clients.length) {
                keyboard.unshift(
                  [Markup.button.callback("Внести клиента")],
                  [Markup.button.callback("Удалить заявку")]
                );
              }
              await ctx.reply(
                format(clients, {
                  ОГРН: "ogrn",
                  ИНН: "inn",
                  Почта: "mail",
                  "Контактная почта": "mail_personal",
                  Телефон: "phone",
                  "Контактный телефон": "phone_personal",
                  ФИО: "fio",
                }),
                {
                  reply_markup: {
                    keyboard,
                  },
                }
              );
            },
          },
          {
            path: "/verify",
            children: [
              {
                path: "",
                action: async ({ ctx, router }) => {
                  ctx.reply("Вводите данные в формате ключ: значение (пример ОГРН: 123)");
                },
              },
              {
                path: "/message",
                action: async ({ ctx, router }) => {
                  const { text } = ctx.update.message;
                  if (text == "Назад") {
                    await router.redirect("/admin", ctx);
                    return;
                  }
                  const data = parse(text, glossary.collaborator);
                  if (!data) {
                    await ctx.reply("Заявка не найдена.");
                    return;
                  }
                  const user = await controllers.getUsers(
                    { ...data, verified: false },
                    false
                  );

                  if (user) {
                    const updated = await controllers.changeUserData(
                      { verified: true },
                      user.id,
                      "admin"
                    );
                    await ctx.reply("Заявка одобрена.");
                  } else {
                    await ctx.reply("Заявка не найдена.");
                  }
                },
              },
            ],
          },
          {
            path: "/delete",
            children: [
              {
                path: "",
                action: async ({ ctx, router }) => {
                  ctx.reply("Вводите данные в формате ключ: значение (пример ОГРН: 123)", {
                    reply_markup: {
                      keyboard: [[Markup.button.callback("Назад")]],
                    },
                  });
                },
              },
              {
                path: "/message",
                action: async ({ ctx, router }) => {
                  const text = ctx.update.message.text;
                  if (text == "Назад") {
                    await router.redirect("/admin/unverified", ctx);
                    return;
                  }
                  const data = parse(text, glossary.collaborator);
                  console.log(data);
                  if (!data) {
                    await ctx.reply("Заявка не найдена.");
                    return;
                  }
                  const user = await controllers.deleteUser({
                    ...data,
                    verified: false,
                  });
                  if (user) {
                    await ctx.reply("Заявка удалена.");
                  } else {
                    await ctx.reply("Заявка не найдена.");
                  }
                },
              },
            ],
          },
          {
            path: "/message",
            action: async ({ ctx, router }) => {
              const text = ctx.update.message.text;
              if (text == "Внести клиента") {
                router.redirect("/admin/unverified/verify", ctx);
              }
              if (text == "Удалить заявку") {
                router.redirect("/admin/unverified/delete", ctx);
              }
              if (text == "Назад") {
                router.redirect("/admin", ctx);
              }
            },
          },
        ],
      },
    ],
  },
];
