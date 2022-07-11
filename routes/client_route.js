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
          const { fio } = ctx.session;
          await ctx.reply("Выберите действие", {
            reply_markup: {
              remove_keyboard: true,
              keyboard: [
                [Markup.button.callback("Прайс-лист")],
                [Markup.button.callback("Мои контактные данные")],
                [Markup.button.callback("Контактные данные организации")],
                [Markup.button.callback("Выйти")],
              ],
            },
          });
          return true;
        },
      },
      {
        path: "/message",
        action: async ({ ctx, router }) => {
          const text = ctx.update.message.text;
          if (text == "Выйти") {
            controllers.logoutUser(ctx.session.userId);
            delete ctx.session.fio;
            delete ctx.session.userId;
            await router.redirect("/select-action", ctx);
          }
          if (text == "Мои контактные данные") {
            await router.redirect("/client/contacts", ctx);
          }
          if (text == "Контактные данные организации") {
            const data = await controllers.getUserData({
              id: ctx.session.userId,
            });
            await ctx.reply(`Контактные данные: сайт http://progsmed.ru/, почта progressmed38@yandex.ru, телефон +7 (908)-664-78-65, адрес Иркутск улица 5-й Армии 2/1`           
            );
          }
          if (text == "Прайс-лист") {
            const pricelist = (
              await controllers.getUserData(ctx.session.userId)
            ).coefficient;
            await ctx.reply(pricelist || "Вам ещё не назначен прайс-лист");
          }
        },
      },
      {
        path: "/contacts",
        children: [
          {
            path: "",
            action: async ({ ctx, router }) => {
              const data = await controllers.getUserData({
                id: ctx.session.userId,
              });
              await ctx.reply(
                "Для изменения данных вводите новые данные в формате ключ: значение (пример телефон:123)"
              );
              ctx.reply(
                format(data, {
                  "Контактная почта": "mail_personal",
                  "Контактный телефон": "phone_personal",
                  ФИО: "fio",
                }),
                {
                  reply_markup: {
                    //remove_keyboard: true,
                    keyboard: [
                      [
                        Markup.button.callback(
                          "Начать изменение контактных данных"
                        ),
                      ],
                      [Markup.button.callback("Назад")],
                    ],
                  },
                }
              );
            },
          },
          {
            path: "/message",
            action: async ({ ctx, router }) => {
              if (
                ctx.update.message.text == "Начать изменение контактных данных"
              ) {
                await router.redirect("/client/contacts/change", ctx);
              }
              if (ctx.update.message.text == "Назад") {
                await router.redirect("/client", ctx);
              }
              return true;
            },
          },
          {
            path: "/change",
            children: [
              {
                path: "",
                action: async ({ ctx }) => {
                  ctx.reply(
                    "Вводите данные в формате ключ: значение через запятую (пример телефон:123, почта: U@yandex.ru)",
                    {
                      reply_markup: {
                        keyboard: [
                          //[Markup.button.callback("Пропустить")],
                          //[Markup.button.callback("Назад")],
                          [Markup.button.callback("Отменить изменение")],
                        ],
                      },
                    }
                  );
                },
              },
              {
                path: "/message",
                action: async ({ ctx, router }) => {
                  const text = ctx.update.message.text;
                  if (text == "Отменить изменение") {
                    await router.redirect("/client", ctx);
                    return;
                  }
                  const data = parse(text, glossary.client);
                  if (!data) {
                    await ctx.reply("Введите корректные данные.");
                    return;
                  }
                  const client = await controllers.changeUserData(
                    data,
                    ctx.session.userId,
                    "user"
                  );
                  console.log(client);
                  if (client) {
                    await ctx.reply("Данные были успешно изменены.");
                    await router.redirect("/client", ctx);
                  } else {
                    await ctx.reply("Введите корректные данные.");
                  }
                },
              },
            ],
          },
        ],
      },
    ],
  },
];
