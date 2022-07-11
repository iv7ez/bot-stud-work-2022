const { getMessage } = require("telegraf-router");
const { Markup } = require("telegraf");
const controllers = require("../methods");
module.exports = [
  {
    children: [
      {
        path: "",
        action: async function ({ ctx }) {
          await ctx.reply("Введите Email или телефон организации, как при регистрации", {
            reply_markup: {
              keyboard: [[Markup.button.callback("Отменить")]],
            },
          });
          return true;
        },
      },
      {
        path: "/message",
        action: async function ({ ctx, router }) {
          const answer = getMessage(ctx).text;
          if (answer == "Отменить") {
            await router.redirect("/select-action", ctx);
            return;
          }
          if (ctx.session.login_email == null) {
            ctx.session.login_email = answer;
            await ctx.reply("Введите пароль");
          } else if (ctx.session.login_password == null) {
            ctx.session.login_password = answer;

            const client = await controllers.loginUser(
              {
                email: ctx.session.login_email,
                phone: ctx.session.login_phone,
                password: ctx.session.login_password,
              },
              "user",
              ctx.message.chat.id
            );
            const admin = (
              await controllers.loginUser(
                {
                  email: ctx.session.login_email,
                  phone: ctx.session.login_phone,
                  password: ctx.session.login_password,
                },
                "admin",
                ctx.message.chat.id
              )
            ).user;

            ctx.session.login_email = null;
            ctx.session.login_password = null;
            if (client.user) {
              const { user, messages } = client;
              ctx.session.userId = user.id;
              ctx.session.fio = user.fio;
              await ctx.reply(`Здравствуйте${user.fio ? ", " + user.fio : ""}`);
              for (let msg of messages) {
                await ctx.reply(msg.text);
              }
              await router.redirect("/client", ctx);
            } else if (admin) {
              ctx.session.adminId = admin.id;
              await router.redirect("/admin", ctx);
            } else {
              await ctx.reply("Неверные данные");
              await router.redirect("/select-action", ctx);
            }
          }
        },
      },
    ],
  },
];
