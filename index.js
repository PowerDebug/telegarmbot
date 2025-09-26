const TelegramBot = require('node-telegram-bot-api');
const {gameOptions, againOptions} = require('./options')
const suquelize = require('./db')
const UserModel = require('./modele')
const token = '8356061371:AAHxI9K8w51b_LaDvcBgsKaQ09n7iyxkrqw'

const bot = new TelegramBot(token, {polling: true})

const chats = {}

const startGame = async (chatId) => {
    await bot.sendMessage(chatId, `Сейчас я загадаю цифру от 0 до 9, а ты должен её угадать!`)
    const randomNumber = Math.floor(Math.random() * 10)
    chats[chatId] = randomNumber;
    await bot.sendMessage(chatId, 'Отгадывай', gameOptions)
}

const start = async () => {

    try {
        await suquelize.authenticate()
        await suquelize.sync()
    } catch (e) {
        console.log('Подключение к бд сломалось')
    }

    bot.setMyCommands([
        {command: '/start', description: 'Начальное приветствие'},
        {command: '/info', description: 'Получить информацию о пользователе'},
        {command: '/game', description: 'Сыграть в игру, угадай число!'},
    ])

    bot.on('message',  async msg => {
        const text = msg.text
        const  chatId = msg.chat.id

        try {
            if (text === '/start') {
                // await UserModel.create({chatId})
                await bot.sendSticker(chatId, 'https://tlgrm.ru/_/stickers/2ad/834/2ad8341a-31fd-36c7-9af3-10820cfcbe51/1.webp')
                return bot.sendMessage(chatId, `Добро пожаловать в телеграмм бот тест `)
            }
            if (text === '/info') {
                const user = await UserModel.findOne({chatId})
                return bot.sendMessage(chatId, `Тебя зовут ${msg.from.username}, в игре у тебя правильных ответов ${user.right}, неправильных ${user.wrong}`)
            }
            if (text === '/game') {
                startGame(chatId)
            }
            else {
                return bot.sendMessage(chatId,'Я тебя не понимаю, поробуй ещё раз!')
            }
        } catch (e) {
            return bot.sendMessage(chatId, 'Произошла ошибка ALERT!')
        }
    })

    //Отслеживания события callback_query
    bot.on('callback_query', async msg => {
        const data = msg.data
        const chatId = msg.message.chat.id;
        if (data === '/again') {
            return startGame(chatId)
        }
        const user = await UserModel.findOne({chatId})

        if (data === chats[chatId]) {
            user.right += 1;
            await bot.sendMessage(chatId, `Поздравляю ты отгадал цифру ${chats[chatId]}`, againOptions)
        } else {
            user.wrong += 1;
            await bot.sendMessage(chatId, `К сожелению ты не угадал, бот выбрал цифру ${chats[chatId]}`, againOptions)
        }
        await user.save();
    })
}

start()
