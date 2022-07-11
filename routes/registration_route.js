const { getMessage } = require("telegraf-router");
const { Markup } = require("telegraf");
const controllers = require("../methods");
const registration_steps = require("../assets/registrationSteps")
module.exports = [
    {
      children: [
        {
          path: "",
          action: async function RegisterScene({ ctx, params, router }) {
            await router.redirect("/form/register/ogrn", ctx);
            return true;
          },
        },
        {
          path: "/:title/message",
          action: async function RegisterScene({ ctx, params, router }) {
            const stepIndex = registration_steps.findIndex(
              (s) => s.title == params.title
            );
            if (stepIndex == -1) {
              return;
            }
            const answer = getMessage(ctx).text;
            if (answer == "Отменить регистрацию") {
              await router.redirect("/form/register/cancel", ctx);
              return;
            }
            if (answer == "Назад") {
              await router.redirect("/form/register/back", ctx);
              return;
            }
            if (answer == "Пропустить") {
              await router.redirect("/form/register/omit", ctx);
              return;
            }
            const step = ctx.session.step;
            if (!step) {
              return;
            }
            const currentStep = registration_steps[stepIndex];
            if (currentStep.validate && !currentStep.validate.test(answer)) {
              await ctx.reply("Некорректные данные. " + currentStep.message);
              return;
            }
            ctx.session[step] = answer;
            const nextStep = registration_steps[stepIndex + 1];
            if (!nextStep) {
              ctx.session.step = null;
              await router.redirect("/form/register/submit", ctx);
              return;
            }
            ctx.session.step = nextStep.title;
            await router.redirect("/form/register/" + nextStep.title, ctx);
          },
        },
        {
          path: "/:title",
          action: async function ({ ctx, params, router }) {
            const stepIndex = registration_steps.findIndex(
              (s) => s.title == params.title
            );
            if (stepIndex == -1) {
              return;
            }
            const { title, allowNull, message } = registration_steps[stepIndex];
            ctx.session.step = title;
            const keyboard = [
              [Markup.button.callback("Отменить регистрацию", "")],
            ];
  
            if (stepIndex !== 0) {
              keyboard.unshift(["Назад"]);
            }
            console.log(ctx.session[allowNull]);
            if (allowNull === true || ctx.session[allowNull]) {
              keyboard.unshift([Markup.button.callback("Пропустить", "")]);
            }
            await ctx.reply(message, {
              reply_markup: {
                remove_keyboard: true,
                keyboard,
              },
            });
            return true;
          },
        },
        {
          path: "/cancel",
          action: async function CancelScene({ ctx, params, router }) {
            await router.redirect("/select-action", ctx);
            return true;
          },
        },
        {
          path: "/back",
          action: async function ({ ctx, params, router }) {
            const stepIndex = registration_steps.findIndex(
                (s) => s.title == ctx.session.step
              ),
              previous = registration_steps[stepIndex - 1];
            await router.redirect("/form/register/" + previous.title, ctx);
          },
        },
        {
          path: "/omit",
          action: async function ({ ctx, params, router }) {
            ctx.session[ctx.session.step] = null;
            const stepIndex = registration_steps.findIndex(
                (s) => s.title == ctx.session.step
              ),
              nextStep = registration_steps[stepIndex + 1];
            if (nextStep) {
              await router.redirect("/form/register/" + nextStep.title, ctx);
            } else {
              await router.redirect("/form/register/submit", ctx);
            }
          },
        },
        {
          path: "/submit",
          action: async function ({ ctx, params, router }) {
            const {
              inn,
              ogrn,
              phone,
              mail,
              phone_personal,
              mail_personal,
              fio,
              password,
            } = ctx.session;
            const result = await controllers.addUser({
              inn,
              ogrn,
              phone,
              mail,
              phone_personal,
              mail_personal,
              fio,
              password,
              verified: false,
            });
            const {error} = result
            console.log(result)
            if (!error) {
              ctx.session.userId = result.id;
              await ctx.reply(`Здравствуйте${fio ? ", " + fio : ""}`);
  
              router.redirect("/client", ctx);
            } 
            if(error == 1){
              await ctx.reply("Недостаточно информации или данные в некорректном формате");
              router.redirect("/select-action", ctx);
            }
            if(error == 2){
              await ctx.reply("Такие реквизиты уже были использованы для регистрации");
              router.redirect("/select-action", ctx);
            }
            if(error == 3){
              await ctx.reply("Компании с указанными реквизитами не существует");
              router.redirect("/select-action", ctx);
            }
          },
        },
      ],
    },
  ];