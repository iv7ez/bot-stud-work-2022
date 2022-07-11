const { Markup } = require("telegraf");
const contacts = require("./examples/contacts.json");
const {
  register_routes,
  login_routes,
  admin_routes,
  client_routes,
} = require("./routes");
const routes = [
  {
    path: "start",
    action: async function StartScene({ ctx, params, router }) {
      await router.redirect(
        ctx.session.userId
          ? "/client"
          : ctx.session.adminId
          ? "/admin"
          : "/select-action",
        ctx
      );
      return true;
    },
  },
  {
    path: "/select-action",
    children: [
      {
        path: "",
        action: async function StartScene({ ctx, params, router }) {
          await ctx.reply("Чем могу помочь?", {
            reply_markup: {
              remove_keyboard: true,
              keyboard: [
                [Markup.button.callback("Войти")],
                [Markup.button.callback("Зарегистрироваться")],
                [Markup.button.callback("Ассортимент")],
                [Markup.button.callback("Помощь")],
                [Markup.button.callback("Контактные данные Организации")],
              ],
            },
          });
          return true;
        },
      },
      {
        path: "/message",
        action: async function ({ ctx, params, router }) {
          if (ctx.update.message.text == "Зарегистрироваться") {
            await router.redirect("/form/register", ctx);
          }
          if (ctx.update.message.text == "Войти") {
            await router.redirect("/form/login", ctx);
          }
          if (ctx.update.message.text == "Ассортимент") {
            await ctx.reply("Ассортимент: " + contacts.assortiment);
          }
          if (ctx.update.message.text == "Помощь") {
            await ctx.reply(
              `Вы находитесь в официальном Телеграм боте организации ${contacts.organisation_name}, руководство пользования https://disk.yandex.ru/i/ItSuW4MhgTaGoQ`
            );
          }
          if (ctx.update.message.text == "Контактные данные Организации") {
            await ctx.reply(
              `Контактные данные: сайт ${contacts.site}, почта ${contacts.email}, телефон +7 (908)-664-78-65, адрес Иркутск улица 5-й Армии 2/1`
            );
          }
        },
      },
    ],
  },
  {
    path: "/form",
    children: [
      {
        path: "/register",
        children: register_routes,
      },
      {
        path: "/login",
        children: login_routes,
      },
    ],
  },
  {
    path: "/client",
    children: client_routes,
  },
  {
    path: "/admin",
    children: admin_routes,
  },
];

module.exports = routes;
